<?php
/**
 * SignaLink — Billboard enrollment form handler
 * Sends an email notification using PHP mail() (Hostinger supports this natively).
 * No plugins or SMTP libraries required.
 *
 * TO DO: Change $SEND_TO below to the email address where you want
 * to receive enrollment enquiries.
 */

// ============================================================
//  CONFIG — edit this line
// ============================================================
$SEND_TO = 'you@example.com';   // <-- replace with your email
$SUBJECT = 'New Billboard Enrollment — SignaLink';
// ============================================================

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed']);
  exit;
}

// ---------- Collect & sanitize fields ----------
function field($key, $default = '') {
  $val = isset($_POST[$key]) ? trim($_POST[$key]) : $default;
  return htmlspecialchars(strip_tags($val), ENT_QUOTES, 'UTF-8');
}

$data = [
  'company'      => field('company'),
  'owner'        => field('owner'),
  'phone'        => field('phone'),
  'email'        => field('email'),
  'location'     => field('location'),
  'maps'         => field('maps'),
  'size'         => field('size'),
  'resolution'   => field('resolution'),
  'type'         => field('type'),
  'screens'      => field('screens'),
  'hours'        => field('hours'),
  'software'     => field('software', 'N/A'),
  'connectivity' => field('connectivity'),
  'availability' => field('availability'),
  'plan'         => field('plan'),
  'notes'        => field('notes', 'N/A'),
];

// ---------- Server-side validation ----------
$errors = [];

if ($data['company'] === '')      $errors[] = 'Company name is required';
if ($data['owner'] === '')        $errors[] = 'Owner name is required';
if (!preg_match('/^[+]?[\d\s\-()]{8,15}$/', $data['phone']))
  $errors[] = 'Valid phone number is required';
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL))
  $errors[] = 'Valid email is required';
if ($data['location'] === '')     $errors[] = 'Billboard location is required';
if ($data['size'] === '')         $errors[] = 'Screen size is required';
if ($data['resolution'] === '')   $errors[] = 'Resolution is required';
if ($data['type'] === '')         $errors[] = 'Billboard type is required';
if ((int)$data['screens'] < 1)    $errors[] = 'At least 1 screen is required';
if ($data['hours'] === '')        $errors[] = 'Operating hours are required';
if ($data['connectivity'] === '') $errors[] = 'Connectivity type is required';
if ($data['availability'] === '') $errors[] = 'Availability is required';
if ($data['plan'] === '')         $errors[] = 'Service plan is required';
if ($data['maps'] !== '' && !filter_var($data['maps'], FILTER_VALIDATE_URL))
  $errors[] = 'Google Maps link must be a valid URL';

if (!empty($errors)) {
  http_response_code(422);
  echo json_encode(['success' => false, 'message' => implode('; ', $errors)]);
  exit;
}

// ---------- Build email ----------
$date = date('d M Y, h:i A');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

$body  = "NEW BILLBOARD ENROLLMENT\n";
$body .= "=========================\n\n";
$body .= "Date: $date\n";
$body .= "Submitted from IP: $ip\n\n";
$body .= "COMPANY DETAILS\n";
$body .= "---------------\n";
$body .= "Company Name : {$data['company']}\n";
$body .= "Owner Name   : {$data['owner']}\n";
$body .= "Phone        : {$data['phone']}\n";
$body .= "Email        : {$data['email']}\n\n";
$body .= "BILLBOARD DETAILS\n";
$body .= "-----------------\n";
$body .= "Location      : {$data['location']}\n";
$body .= "Google Maps   : {$data['maps']}\n";
$body .= "Screen Size   : {$data['size']}\n";
$body .= "Resolution    : {$data['resolution']}\n";
$body .= "Billboard Type: {$data['type']}\n";
$body .= "No. of Screens: {$data['screens']}\n";
$body .= "Operating Hrs : {$data['hours']}\n";
$body .= "Current SW    : {$data['software']}\n";
$body .= "Internet      : {$data['connectivity']}\n";
$body .= "Availability  : {$data['availability']}\n\n";
$body .= "SERVICE\n";
$body .= "-------\n";
$body .= "Preferred Plan: {$data['plan']}\n\n";
$body .= "ADDITIONAL NOTES\n";
$body .= "----------------\n";
$body .= $data['notes'] . "\n";

$headers  = "From: SignaLink Website <noreply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n";
$headers .= "Reply-To: {$data['owner']} <{$data['email']}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

// ---------- Send ----------
$sent = @mail($SEND_TO, $SUBJECT, $body, $headers);

if ($sent) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Email could not be sent. Please contact us directly.',
  ]);
}
