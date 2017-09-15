// dependencies
const AWS = require('aws-sdk');
const objectMapper = require('object-mapper');

const sendEmailMap = {
  // recipient info
  'recipientInfo.bcc': 'Destination.BccAddresses',
  'recipientInfo.cc': 'Destination.CcAddresses',
  'recipientInfo.to': 'Destination.ToAddresses',

  // content info
  'content.body.charset': {
    key: 'Message.Body.Html.Charset',
    default: 'UTF-8',
  },
  'content.body.data': 'Message.Body.Html.Data',
  'content.subject.charset': {
    key: 'Message.Subject.Charset',
    default: 'UTF-8',
  },
  'content.subject.data': 'Message.Subject.Data',
  'content.returnPath': 'ReturnPath',
  'content.tags': 'Tags',

  // from information
  'fromInfo.confugrationName': 'ConfigurationSetName',
  'fromInfo.from': 'Source',
  'fromInfo.replyTo': 'ReplyToAddresses',
};

module.exports = ({ credentials }) => {
  const ses = new AWS.SES(credentials);

  const sendEmail = ({ fromInfo, recipientInfo, content }) => (
    ses.sendEmail(objectMapper({ fromInfo, recipientInfo, content }, sendEmailMap)).promise()
  );

  return {
    sendEmail,
  };
};
