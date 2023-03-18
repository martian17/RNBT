import {decodeNBT} from "nbt.js";
import {encodeRNBT, decodeRNBT} from "../rnbt.mjs";
import zlib from "zlib";
import {promises as fs} from "fs";
import util from "util";

const inflate = util.promisify(zlib.inflate);
const gunzip = util.promisify(zlib.gunzip);

const filename = "./level.dat";

const buff = await (fs.readFile(filename));
const nbt1 = await decodeNBT(await gunzip(buff));

const rnbt1 = encodeRNBT(nbt1);

console.log(rnbt1);

const nbt2 = decodeRNBT(rnbt1);

const rnbt2 = encodeRNBT(nbt2);


if(rnbt1 === rnbt2){
    console.log("test success");
}else{
    console.log("test failure");
}


