var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = inputs[2];

function decrypt(buffer){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
  return dec;
}
 
output = decrypt(Buffer.from(inputs[1], "base64")).toString('utf8');
