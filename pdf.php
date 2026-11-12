<?php
declare(strict_types=1);

// Serve only PDFs listed in the public catalog, from the Tribunal's HTTPS host.
if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) {
    header('Allow: GET, HEAD');
    http_response_code(405);
    exit;
}

$id = $_GET['id'] ?? '';
if (!is_string($id) || preg_match('/^[a-f0-9]{14}$/D', $id) !== 1) {
    http_response_code(400);
    exit('Identificador de documento inválido.');
}

$catalog = json_decode((string) file_get_contents(__DIR__ . '/catalog.json'), true);
if (!is_array($catalog)) {
    http_response_code(500);
    exit('El catálogo no está disponible.');
}

$document = null;
foreach ($catalog as $item) {
    if (($item['id'] ?? null) === $id) {
        $document = $item;
        break;
    }
}
if ($document === null) {
    http_response_code(404);
    exit('Documento no encontrado.');
}

$source = $document['source'] ?? '';
$parts = is_string($source) ? parse_url($source) : false;
if (!is_array($parts)
    || ($parts['scheme'] ?? '') !== 'https'
    || !in_array($parts['host'] ?? '', ['tjan.gob.mx', 'www.tjan.gob.mx'], true)
    || isset($parts['port'])
    || isset($parts['user'])
    || isset($parts['pass'])) {
    http_response_code(403);
    exit('Origen de documento no permitido.');
}

$range = $_SERVER['HTTP_RANGE'] ?? '';
$requestHeaders = ['Accept: application/pdf', 'Accept-Encoding: identity'];
if (is_string($range) && preg_match('/^bytes=\d*-\d*$/D', $range) === 1) {
    $requestHeaders[] = 'Range: ' . $range;
}

$remoteStatus = 0;
$remoteHeaders = [];
$sent = false;
$download = isset($_GET['download']);
$isHead = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD';

$sendHeaders = static function () use (&$remoteStatus, &$remoteHeaders, &$sent, $download, $id): void {
    if ($sent) {
        return;
    }
    $sent = true;
    http_response_code($remoteStatus);
    header('Content-Type: application/pdf');
    header('Content-Disposition: ' . ($download ? 'attachment' : 'inline') . '; filename="documento-' . $id . '.pdf"');
    header('Cache-Control: public, max-age=3600');
    header('X-Content-Type-Options: nosniff');
    foreach (['content-length', 'content-range', 'accept-ranges', 'last-modified', 'etag'] as $name) {
        if (isset($remoteHeaders[$name])) {
            header($name . ': ' . $remoteHeaders[$name]);
        }
    }
};

$curl = curl_init($source);
curl_setopt_array($curl, [
    CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_TIMEOUT => 150,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_HTTPHEADER => $requestHeaders,
    CURLOPT_NOBODY => $isHead,
    CURLOPT_HEADERFUNCTION => static function ($handle, string $line) use (&$remoteStatus, &$remoteHeaders): int {
        if (preg_match('/^HTTP\/\S+\s+(\d{3})/', $line, $match) === 1) {
            $remoteStatus = (int) $match[1];
            $remoteHeaders = [];
        } elseif (str_contains($line, ':')) {
            [$name, $value] = explode(':', $line, 2);
            $remoteHeaders[strtolower(trim($name))] = trim($value);
        }
        return strlen($line);
    },
    CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$remoteStatus, &$remoteHeaders, &$sent, $sendHeaders): int {
        $type = strtolower($remoteHeaders['content-type'] ?? '');
        if (in_array($remoteStatus, [200, 206], true) && str_contains($type, 'pdf')) {
            if (!$sent) {
                $sendHeaders();
            }
            echo $chunk;
        }
        return strlen($chunk);
    },
]);
$caBundle = '/Applications/XAMPP/xamppfiles/share/curl/curl-ca-bundle.crt';
if (is_file($caBundle)) {
    curl_setopt($curl, CURLOPT_CAINFO, $caBundle);
}

$success = curl_exec($curl);
$error = curl_error($curl);
curl_close($curl);

$isPdf = str_contains(strtolower($remoteHeaders['content-type'] ?? ''), 'pdf');
if ($success !== false && in_array($remoteStatus, [200, 206], true) && $isPdf) {
    if (!$sent) {
        $sendHeaders();
    }
    exit;
}
if (!$sent) {
    http_response_code($remoteStatus === 404 ? 404 : 502);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    if (!$isHead) {
        echo 'El PDF oficial no está disponible en este momento.';
    }
}
error_log('TJAN PDF proxy failed for ' . $id . ': ' . ($error ?: 'respuesta HTTP ' . $remoteStatus));
