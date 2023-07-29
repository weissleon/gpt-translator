const { encode } = require("gpt-tokenizer");

const text = "`Muy bien?!`";

const token = encode(text);

console.log(token);
