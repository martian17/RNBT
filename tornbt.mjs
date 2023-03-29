import {decodeNBT} from "nbt.js";
import {encodeRNBT} from "./lib/rnbt.js";
import zlib from "zlib";
import {promises as fs} from "fs";
import util from "util";

const inflate = util.promisify(zlib.inflate);
const gunzip = util.promisify(zlib.gunzip);

const filename = process.argv[2];
if(!filename){
    console.log("please specify the file name");
    process.exit();
}
const buff = await (fs.readFile(filename));
const res = await decodeNBT(await gunzip(buff));

console.log(encodeRNBT(res,true,2,true));

