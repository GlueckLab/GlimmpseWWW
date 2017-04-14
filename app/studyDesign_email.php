<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>PHPMailer - studyDesign Email</title>
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
    $mail->setFrom('samplesizeshop@gmail.com', 'Sample Size Shop');
    //$mail->addReplyTo($_REQUEST["email"], $_REQUEST["name"]);

    //Set who the message is to be sent to
      $mail->addAddress($_REQUEST["email"], $_REQUEST["name"]);

    //Set the subject line
    $mail->Subject = 'StudyDesign Object File';

    // create the message body
    $mail->Body = "<html><head></head><body>";
    $mail->Body .= "<p>Dear " . $_REQUEST["name"] . "</p>";
    $mail->Body .= "<p>Details:</p><p>" . 'Thank you for using GLIMMPSE.
    Your study design object is attached to this email. To learn more about
    power and sample size, please visit http://samplesizeshop.org.' . "</p>";
    $mail->Body .= "</body></html>";

           $mail->AltBody = "Please use an HTML compatible email viewer";

    //Attach the study design string object

        $mail->addStringAttachment($_REQUEST["data"], $_REQUEST["filename"], "base64", "application/json");


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
