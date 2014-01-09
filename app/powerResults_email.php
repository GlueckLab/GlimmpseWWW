<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>PHPMailer - Power Results Email</title>
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


    //Set who the message is to be sent to
      $mail->addAddress($_REQUEST["email"], $_REQUEST["name"]);

    //Set the subject line
    $mail->Subject = 'Power Results File';

    // create the message body
    $mail->Body = "<html><head></head><body>";
    $mail->Body .= "<p>Dear " . $_REQUEST["name"] . "</p>";
    $mail->Body .= "<p>Details:</p><p>" . 'Thank you for using Glimmpse.
    Your power results are attached to this email. To learn more about
    power and sample size, please visit http://samplesizeshop.org.' . "</p>";
    $mail->Body .= "</body></html>";

           $mail->AltBody = "Please use an HTML compatible email viewer";

    //Attach the power results csv file

            $mail->addStringAttachment($_REQUEST["resultsData"], $_REQUEST["resultsFilename"], "base64", "application/csv");

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