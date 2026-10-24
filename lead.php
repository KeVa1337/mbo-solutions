<?php
/**
 * Receives a lead from the site forms and sends it to Telegram.
 *
 * The bot token is NOT stored in the repository (it is public). Create a config
 * file on the server — preferably one level ABOVE public_html:
 *
 *   <?php return ['token' => '123456:ABC...', 'chats' => ['123456789']];
 *
 * Optional copy of every lead to Jarvis (dashboard, stats):
 *   'jarvis_url' => 'https://jarvis.mbo-solutions.com', 'jarvis_token' => '<LEADS_TOKEN from Coolify>'
 *
 * Looked up in this order:
 *   1) ../mbo-telegram.php           (outside the web root — recommended)
 *   2) ./telegram-config.php         (next to this file; ignored by git, blocked by .htaccess)
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Real visitor IP even behind Hostinger CDN / Cloudflare / proxies
function client_ip() {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_TRUE_CLIENT_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR'] as $h) {
        if (!empty($_SERVER[$h])) {
            $ip = trim(explode(',', $_SERVER[$h])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0';
}

// Masked IP for diagnostics: 93.170.12.34 -> 93.170.x.x
function mask_ip($ip) { return preg_replace(['/^(\d+\.\d+)\.\d+\.\d+$/', '/^([0-9a-f]+:[0-9a-f]+):.*$/i'], ['$1.x.x', '$1:…'], trim((string) $ip)); }

// Telegram API call: curl over IPv4 (hosting IPv6 routes to Telegram are often flaky), one retry
function tg($url, $payload = null) {
    for ($try = 0; $try < 2; $try++) {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4]);
            if ($payload !== null) curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => ['Content-Type: application/json']]);
            $body = curl_exec($ch); curl_close($ch);
        } else {
            $opts = ['timeout' => 10, 'ignore_errors' => true];
            if ($payload !== null) $opts += ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => json_encode($payload)];
            $body = @file_get_contents($url, false, stream_context_create(['http' => $opts]));
        }
        $res = json_decode((string) $body, true);
        if (is_array($res)) return $res;   // Telegram answered (ok or a real API error) — no retry
        usleep(400000);
    }
    return null;
}

function out($code, $data) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }

// Self-check: open /lead.php?check=1 in a browser (never reveals the token)
if (isset($_GET['check'])) {
    $found = null; $cfgC = null;
    foreach ([dirname(__DIR__) . '/mbo-telegram.php', __DIR__ . '/telegram-config.php'] as $f) {
        if (is_file($f)) { $found = basename($f); $cfgC = @include $f; break; }
    }
    $r = ['lead_php' => 'ok', 'php' => PHP_VERSION, 'config_file' => $found ?: 'НЕ ЗНАЙДЕНО',
          'config_valid' => is_array($cfgC) && !empty($cfgC['token']) && !empty($cfgC['chats']),
          'allow_url_fopen' => (bool) ini_get('allow_url_fopen'),
          'proxy_headers' => array_values(array_filter(['HTTP_CF_CONNECTING_IP', 'HTTP_TRUE_CLIENT_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR'], fn($h) => !empty($_SERVER[$h]))),
          'ip_remote_addr' => mask_ip($_SERVER['REMOTE_ADDR'] ?? ''),
          'ip_x_real_ip' => mask_ip($_SERVER['HTTP_X_REAL_IP'] ?? ''),
          'ip_x_forwarded_for' => implode(', ', array_map('mask_ip', explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''))),
          'ip_used_for_limit' => mask_ip(client_ip()),
          'curl' => function_exists('curl_init'),
          'jarvis' => is_array($cfgC) && !empty($cfgC['jarvis_url']) && !empty($cfgC['jarvis_token']) ? 'налаштовано' : 'не налаштовано'];
    if ($r['jarvis'] === 'налаштовано' && function_exists('curl_init')) {
        $ch = curl_init(rtrim($cfgC['jarvis_url'], '/') . '/api/leads/ping');
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5, CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_HTTPHEADER => ['X-Leads-Token: ' . $cfgC['jarvis_token']]]);
        $body = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
        $msg = json_decode((string) $body, true)['error'] ?? '';
        $r['jarvis_check'] = $code === 200 ? 'ok' : ($code ? "помилка $code: $msg" : "немає з'єднання: $err");
    }
    if ($r['config_valid']) {
        $api = 'https://api.telegram.org/bot' . $cfgC['token'];
        $me = tg($api . '/getMe');
        $r['telegram_token'] = !empty($me['ok']) ? 'ok (@' . $me['result']['username'] . ')' : ('помилка: ' . ($me['description'] ?? 'немає зʼєднання з api.telegram.org'));
        foreach ((array) $cfgC['chats'] as $chat) {
            $c = tg($api . '/getChat?chat_id=' . urlencode($chat));
            $r['chat_' . $chat] = !empty($c['ok']) ? 'ok' : ('помилка: ' . ($c['description'] ?? 'немає відповіді від api.telegram.org'));
        }
    }
    out(200, $r);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false, 'error' => 'method']);

// Only accept requests from our own pages
$host = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
$oHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
if ($origin !== '' && preg_replace('/^www\./', '', $oHost) !== preg_replace('/^www\./', '', $host)) out(403, ['ok' => false, 'error' => 'origin']);

$cfg = null;
foreach ([dirname(__DIR__) . '/mbo-telegram.php', __DIR__ . '/telegram-config.php'] as $f) {
    if (is_file($f)) { $cfg = include $f; break; }
}
if (!is_array($cfg) || empty($cfg['token']) || empty($cfg['chats'])) out(503, ['ok' => false, 'error' => 'not_configured']);

$in = json_decode((string) file_get_contents('php://input', false, null, 0, 20000), true);
if (!is_array($in)) out(400, ['ok' => false, 'error' => 'bad_json']);

// Honeypot: real visitors never fill this hidden field
if (!empty($in['website'])) out(200, ['ok' => true]);

$subject = trim(mb_substr((string) ($in['subject'] ?? 'Заявка з сайту'), 0, 200));
$lines = array_slice(array_map(fn($l) => mb_substr((string) $l, 0, 1500), (array) ($in['lines'] ?? [])), 0, 40);
if (!array_filter($lines, fn($l) => trim($l) !== '')) out(400, ['ok' => false, 'error' => 'empty']);

// Simple rate limit: max 8 delivered leads per IP per 10 minutes (only successful sends count)
$ip = client_ip();
$rlFile = sys_get_temp_dir() . '/mbo-lead2-' . md5($ip);
$now = time();
$hits = array_values(array_filter((array) json_decode((string) @file_get_contents($rlFile), true), fn($t) => $t > $now - 600));
if (count($hits) >= 8) out(429, ['ok' => false, 'error' => 'rate']);

$esc = fn($s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$page = $esc(mb_substr((string) ($in['page'] ?? ''), 0, 300));
$text = "🔔 <b>" . $esc($subject) . "</b>\n\n" . $esc(implode("\n", $lines))
      . ($page ? "\n\n🌐 " . $page : '')
      . "\n🕒 " . date('d.m.Y H:i');

$api = rtrim($cfg['api'] ?? 'https://api.telegram.org', '/') . '/bot' . $cfg['token'] . '/sendMessage';
$sent = 0;
foreach ((array) $cfg['chats'] as $chat) {
    $res = tg($api, ['chat_id' => $chat, 'text' => $text, 'parse_mode' => 'HTML', 'disable_web_page_preview' => true]);
    if (!empty($res['ok'])) $sent++;
}
// Copy to Jarvis (lead history, daily stats). Optional: add 'jarvis_url' and 'jarvis_token' to the config file.
// Never blocks or fails the visitor's request.
if (!empty($cfg['jarvis_url']) && !empty($cfg['jarvis_token']) && function_exists('curl_init')) {
    $ch = curl_init(rtrim($cfg['jarvis_url'], '/') . '/api/leads');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 4, CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['subject' => $subject, 'lines' => $lines, 'page' => mb_substr((string) ($in['page'] ?? ''), 0, 300)], JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-Leads-Token: ' . $cfg['jarvis_token']]]);
    curl_exec($ch); curl_close($ch);
}

if ($sent) {
    $hits[] = $now;
    @file_put_contents($rlFile, json_encode($hits), LOCK_EX);
    out(200, ['ok' => true]);
}
out(502, ['ok' => false, 'error' => 'telegram']);
