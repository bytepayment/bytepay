let contractAccount = process.argv[2]
let methodName = process.argv[3]
let args = process.argv[4]

let input = Buffer.concat([
    Buffer.from(contractAccount),
    Buffer.from([0]),
    Buffer.from(methodName),
    Buffer.from([0]),
    Buffer.from(args),
])

let encodeArgs = input.toString('base64')
console.log(encodeArgs)
