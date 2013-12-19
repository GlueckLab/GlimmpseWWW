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
    $mail->addAddress('samplesizeshop@gmail.com', 'Sample Size Shop');

    //Set the subject line
    $mail->Subject = 'Glimmpse Feedback';

    // create the message body
    $mail->Body = "<html><head></head><body>";
    $mail->Body .= "<p>Name: " . $_REQUEST["name"] . "</p>";
    $mail->Body .= "<p>Email: " . $_REQUEST["email"] . "</p>";
    $mail->Body .= "<p>Issue: " . $_REQUEST["issue"] . "</p>";
    $mail->Body .= "<p>Details:</p><p>" . $_REQUEST["details"] . "</p>";
    $mail->Body .= "</body></html>";

           $mail->AltBody = "Please use an HTML compatible email viewer";

    //Attach a file
    if (isset($_FILES["file"])) {
        $mail->addAttachment($_FILES["file"]["tmp_name"], $_FILES["file"]["name"]);
    }

    //send the message, check for errors
    if (!$mail->send()) {
        echo $mail->ErrorInfo;
        http_response_code(503);
    } else {
        echo "OK";
    }

} catch (phpmailerException $e) {
    echo $e->errorMessage(); //error messages from PHPMailer
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
</body>
</html>