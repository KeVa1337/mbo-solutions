<?php
/**
 * Receives a lead from the site forms and sends it to Telegram.
 *
 * The bot token is NOT stored in the repository (it is public). Create a config
 * file on the server — preferably one level ABOVE public_html:
 *
 *   <?php return ['token' => '123456:ABC...', 'chats' => ['123456789']];
 *
 * Looked up in this order:
 *   1) ../mbo-telegram.php           (outside the web root — recommended)
 *   2) ./telegram-config.php         (next to this file; ignored by git, blocked by .htaccess)
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out($code, $data) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }

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

// Simple rate limit: max 5 leads per IP per 10 minutes
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$rlFile = sys_get_temp_dir() . '/mbo-lead-' . md5($ip);
$now = time();
$hits = array_filter((array) json_decode((string) @file_get_contents($rlFile), true), fn($t) => $t > $now - 600);
if (count($hits) >= 5) out(429, ['ok' => false, 'error' => 'rate']);
$hits[] = $now;
@file_put_contents($rlFile, json_encode(array_values($hits)), LOCK_EX);

$esc = fn($s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$page = $esc(mb_substr((string) ($in['page'] ?? ''), 0, 300));
$text = "🔔 <b>" . $esc($subject) . "</b>\n\n" . $esc(implode("\n", $lines))
      . ($page ? "\n\n🌐 " . $page : '')
      . "\n🕒 " . date('d.m.Y H:i');

$api = rtrim($cfg['api'] ?? 'https://api.telegram.org', '/') . '/bot' . $cfg['token'] . '/sendMessage';
$sent = 0;
foreach ((array) $cfg['chats'] as $chat) {
    $ctx = stream_context_create(['http' => [
        'method' => 'POST', 'timeout' => 8, 'ignore_errors' => true,
        'header' => "Content-Type: application/json\r\n",
        'content' => json_encode(['chat_id' => $chat, 'text' => $text, 'parse_mode' => 'HTML', 'disable_web_page_preview' => true]),
    ]]);
    $res = json_decode((string) @file_get_contents($api, false, $ctx), true);
    if (!empty($res['ok'])) $sent++;
}
$sent ? out(200, ['ok' => true]) : out(502, ['ok' => false, 'error' => 'telegram']);
