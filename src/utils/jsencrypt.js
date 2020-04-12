import JSEncrypt from 'jsencrypt/bin/jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOeWPlqsxTpIj2GfpdmrLP6YcZ\n' +
  'naodSpJkLA0s0R6pPETiwTXQzJswvX8rrw9QJnNoukhOmaa3n3ROwU51by29+DOG\n' +
  'O2rCa+JNLjwigx1mGeODgW3u/ibcp9hvDKPbm0QtyOdRWRYTmofFlhXGJkH+pOew\n' +
  'kLIAvTBDT1J+vu96WwIDAQAB'

const privateKey = 'MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAM55Y+WqzFOkiPYZ\n' +
  '+l2ass/phxmdqh1KkmQsDSzRHqk8ROLBNdDMmzC9fyuvD1Amc2i6SE6ZprefdE7B\n' +
  'TnVvLb34M4Y7asJr4k0uPCKDHWYZ44OBbe7+Jtyn2G8Mo9ubRC3I51FZFhOah8WW\n' +
  'FcYmQf6k57CQsgC9MENPUn6+73pbAgMBAAECgYEAlSHIrdI30xI8esU4uPNLxDCA\n' +
  'jFf8zztVkVTgD0bcRpBpkP7MyAuA7Cty9zJydQnQwgwKvfrtGCPr9hZZfSjYd9hZ\n' +
  'offW5X3ZxgOzDzvsJ76WGe10N/iYgZxBHswI0MmZKkZuh1AOPwI6WxVSRpRNKTPK\n' +
  '7SIJGvxanHTj6Gxzy8ECQQD9vSlw4p/vv9qW5UDUTw/yv4jdcv9b19skDWsd29n9\n' +
  'LrlPnEiKg4yzCaIcFFDbtHyI2iXu2jQE2U1yevqrhvM1AkEA0FBoCDklnhoIhMXX\n' +
  'Qu13tjroJafslFTVtGiG/5H8PVUTvC08pXC971wPZz4ubjnu9aeEax8/IH3wHHCP\n' +
  'MWlZTwJBAO7pDDsA90ybnWrU4wzEgKS1GV5BaBUHEoxIoiIUHpWYR92grmDVakYt\n' +
  'fNjpfBTSRSvqEytpgu9J1/VBvAKDZz0CQQCskI89kKma6RH5ezKxXKp4qR+6YftX\n' +
  'fVdzFcwPVs3PuPSaRBcjLdwJtweDjT1FTnSnx1eorb/LmMgZpxzX3999AkEAly1H\n' +
  'jzPtB0kBSNZ9Bcu8v6PJQ5h06ZcC77xEwHLhcWcVSjZTAzeU0LQaj29uEHXhA+NZ\n' +
  'A8VW39nBC+WBaI3HKA=='

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}

