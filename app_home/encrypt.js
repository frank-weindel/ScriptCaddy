var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = inputs[2];

function encrypt(buffer){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
  return crypted;
}
 
output = encrypt(Buffer.from(inputs[1], "utf8")).toString('base64');
