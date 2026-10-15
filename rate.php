<?php
/**
 * Official NBU USD→UAH rate for the site's "$" prices.
 * Fetched from bank.gov.ua at most once per 6 hours and cached on the server,
 * so visitors never call the NBU directly (no CORS issues, no rate limits).
 * Response: {"rate":45.0564,"date":"06.10.2026","source":"NBU"}
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const NBU_URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json';
const TTL = 6 * 3600;
$cacheFile = sys_get_temp_dir() . '/mbo-usd-rate.json';

function read_cache($file) {
    if (!is_file($file)) return null;
    $data = json_decode((string) @file_get_contents($file), true);
    return (is_array($data) && isset($data['rate']) && $data['rate'] > 0) ? $data : null;
}

function fetch_nbu() {
    $ctx = stream_context_create(['http' => ['timeout' => 4, 'header' => "User-Agent: mbo-solutions.com\r\n"]]);
    $raw = @file_get_contents(NBU_URL, false, $ctx);
    if ($raw === false) return null;
    $json = json_decode($raw, true);
    if (!isset($json[0]['rate']) || $json[0]['rate'] <= 0) return null;
    return ['rate' => round((float) $json[0]['rate'], 4), 'date' => (string) ($json[0]['exchangedate'] ?? ''), 'source' => 'NBU'];
}

$cached = read_cache($cacheFile);
if ($cached && (time() - (int) ($cached['fetched'] ?? 0)) < TTL) {
    $result = $cached;
} else {
    $fresh = fetch_nbu();
    if ($fresh) {
        $fresh['fetched'] = time();
        @file_put_contents($cacheFile, json_encode($fresh), LOCK_EX);
        $result = $fresh;
    } else {
        $result = $cached; // NBU unavailable: serve the last known rate, even if old
    }
}

if (!$result) {
    http_response_code(503);
    echo json_encode(['error' => 'rate unavailable']);
    exit;
}

header('Cache-Control: public, max-age=3600');
unset($result['fetched']);
echo json_encode($result);
