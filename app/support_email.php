<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>PHPMailer - sendmail test</title>
</head>
<body>
<?php
require_once('lib/PHPMailer/class.phpmailer.php');
require_once('lib/PHPMailer/class.smtp.php');

try {
    //Create a new PHPMailer instance
    $mail = new PHPMailer();
    // Set PHPMailer to use the sendmail transport
    $mail->isSMTP();

    //Set who the message is to be sent from
    $mail->setFrom($_REQUEST["email"], $_REQUEST["name"]);
    $mail->addReplyTo($_REQUEST["email"], $_REQUEST["name"]);

    //Set who the message is to be sent to
    $mail->addAddress('sarah.kreidler@ucdenver.edu', 'Sample Size Shop');
    $mail->addAddress('sarahkreidler@hotmail.com', 'Sample Size Shop');

    //Set the subject line
    $mail->Subject = 'Glimmpse Feedback';

    // create the message body
    $mail->Body    = 'Issue: ' . $_REQUEST["issue"] . "\n" . "Details: " . $_REQUEST["details"];
    $mail->AltBody = $mail->Body;

    //Attach an image file
    if ($_REQUEST["file"]) {
      $mail->addAttachment($_REQUEST["file"]);
    }


    //send the message, check for errors
    if (!$mail->send()) {
        echo "We're sorry.  An error occurred while submitting your request: " . $mail->ErrorInfo;
    } else {
        echo "Thank you. Your inquiry has been forwarded to our support team." . $_REQUEST["email"];
    }

} catch (phpmailerException $e) {
    echo $e->errorMessage(); //error messages from PHPMailer
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
</body>
</html>