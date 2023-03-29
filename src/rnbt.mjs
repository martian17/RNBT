import {
// enums
    TAG_End,
    TAG_Byte,
    TAG_Short,
    TAG_Int,
    TAG_Long,
    TAG_Float,
    TAG_Double,
    TAG_Byte_Array,
    TAG_String,
    TAG_List,
    TAG_Compound,
    TAG_Int_Array,
    TAG_Long_Array,
// types
    NBT_Byte,
    NBT_Short,
    NBT_Int,
    NBT_Long,
    NBT_Float,
    NBT_Double,
// funcs
    getType
} from "nbt.js";

import {
    obj_isEmpty,
    escapeObjectKey,
    repeatstr,
    skipSpaces
} from "./util.mjs";



// Global objects

const numberConstructors = [];
numberConstructors[TAG_Byte] = NBT_Byte;
numberConstructors[TAG_Short] = NBT_Short;
numberConstructors[TAG_Int] = NBT_Int;
numberConstructors[TAG_Long] = NBT_Long;
numberConstructors[TAG_Float] = NBT_Float;
numberConstructors[TAG_Double] = NBT_Double;

const typenames = [];
typenames[TAG_End] = "null";
typenames[TAG_Byte] = "i8";
typenames[TAG_Short] = "i16";
typenames[TAG_Int] = "i32";
typenames[TAG_Long] = "i64";
typenames[TAG_Float] = "f32";
typenames[TAG_Double] = "f64";
typenames[TAG_Byte_Array] = "i8";
typenames[TAG_String] = "";
typenames[TAG_List] = "";
typenames[TAG_Compound] = "";
typenames[TAG_Int_Array] = "i32";
typenames[TAG_Long_Array] = "i64";

const typenameMap = new Map;
for(let type = TAG_Byte; type <= TAG_Double; type++){
    typenameMap.set(typenames[type],type);
}

const _colors = {
    black: "\u001b[30m",
    red: "\u001b[31m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    blue: "\u001b[34m",
    magenta: "\u001b[35m",
    cyan: "\u001b[36m",
    white: "\u001b[37m",
    reset: "\u001b[0m",
    _black: "\u001b[30;1m",
    _red: "\u001b[31;1m",
    _green: "\u001b[32;1m",
    _yellow: "\u001b[33;1m",
    _blue: "\u001b[34;1m",
    _magenta: "\u001b[35;1m",
    _cyan: "\u001b[36;1m",
    _white: "\u001b[37;1m",
    reset: "\u001b[0m"
};



// Global singletons with mutable states

const colors = {
    number: function(str){
        if(!format.colorize)return str;
        return _colors.yellow + str + _colors.reset;
    },
    string: function(str){
        if(!format.colorize)return str;
        return _colors.green + str + _colors.reset;
    },
    type: function(str){
        if(!format.colorize)return str;
        return _colors.red + str + _colors.reset;
    },
};


const getIndent = (()=>{
    const cache = new Map;
    return function(n){
        if(!format.format)return "";
        if(!cache.has(n*format.indent)){
            cache.set(n*format.indent,repeatstr(" ",n));
        }
        return cache.get(n*format.indent);
    }
})();


const format = {
    format:false,
    indent:2,
    colorize: false
};






// Encoder

const encoders = [];
for(let type of [TAG_Byte, TAG_Short, TAG_Int, TAG_Float, TAG_Double]){
    encoders[type] = function(nbt){
        return colors.type(typenames[type]) + " " + colors.number(nbt.value);
    };
}

encoders[TAG_Long] = function(nbt){
    return colors.type(typenames[TAG_Long]) + " " + colors.number((nbt.value+""));
};

encoders[TAG_Byte_Array] = function(nbt){
    return colors.type(typenames[TAG_Byte_Array]) + " " + colors.number(JSON.stringify([...nbt]));
};

encoders[TAG_String] = function(nbt){
    return colors.string(JSON.stringify(nbt));
};

encoders[TAG_List] = function(nbt, depth){
    if(nbt.length === 0){
        return "[]";
    }
    const type = getType(nbt[0]);
    const indentStr1 = getIndent(depth+1);
    const indentStr = getIndent(depth);
    let res = "[";
    if(format.format)res += "\n";
    let first = true;
    for(let item of nbt){
        if(first){
            first = false;
        }else{
            res += ",";
            if(format.format)res += "\n";
        }
        res += indentStr1;
        res += encoders[type](item, depth+1);
    }
    if(format.format)res += "\n";
    res += `${indentStr}]`;
    return res;
};

encoders[TAG_Compound] = function(nbt, depth){
    if(obj_isEmpty(nbt)){
        return "{}";
    }
    const indentStr1 = getIndent(depth+1);
    const indentStr = getIndent(depth);
    let res = "{";
    if(format.format)res += "\n";
    let first = true;
    for(let key in nbt){
        if(first){
            first = false;
        }else{
            res += ",";
            if(format.format)res += "\n";
        }
        res += indentStr1;
        res += escapeObjectKey(key)+":";
        if(format.format)res += " ";
        const item = nbt[key];
        const type = getType(item);
        res += encoders[type](item, depth+1);
    }
    if(format.format)res += "\n";
    res += indentStr;
    res += `}`;
    return res;
};

encoders[TAG_Int_Array] = function(nbt){
    return `i32 ${JSON.stringify([...nbt])}`;
};

encoders[TAG_Long_Array] = function(nbt){
    return `i64 ${JSON.stringify([...nbt])}`;
};

export const encodeRNBT = function(nbt/*:nbtobject*/, _format = true, indent = 2, colorize = false){
    format.colorize = colorize;
    format.format = _format;
    format.indent = indent;
    return encoders[getType(nbt)](nbt,0);
};



// Decoder

const parseCompound = function(str){
    str = str.slice(1);// skip "{"
    str = skipSpaces(str);
    const res = {};
    if(str[0] === "}"){
        str = str.slice(1);
        str = skipSpaces(str);
        return [res,str];
    }
    while(true){
        if(str.length === 0)
            throw new Error("Unexpected end of input");
        let key;
        if(str[0] === "\""){
            [key,str] = parseString(str);
        }else{
            key = str.match(/[A-Za-z_][A-Za-z0-9_]*/)[0];
            if(key.length === 0){
                throw new Error(`Expected a key, but got ${str[0]} instead.`);
            }
            str = str.slice(key.length);
            str = skipSpaces(str);
        }
        if(str.length === 0)
            throw new Error("Unexpected end of input");
        if(str[0] !== ":")
            throw new Error(`Expected ":", but got "${str[0]}" instead.`);
        str = str.slice(1);
        if(str.length === 0)
            throw new Error("Unexpected end of input");
        let val;
        [val,str] = parseRNBT(str);
        res[key] = val;
        if(str.length === 0)
            throw new Error("Unexpected end of input");
        if(str[0] === "}"){
            str = str.slice(1);
            str = skipSpaces(str);
            break;
        }else if(str[0] === ","){
            str = str.slice(1);
            str = skipSpaces(str);
            continue;
        }else{
            throw new Error(`Unexpected token ${str[0]} in a compound tag`);
        }
    }
    return [res,str];
};

const parseList = function(str){
    str = str.slice(1);// skip "["
    str = skipSpaces(str);
    const res = [];
    if(str[0] === "]"){
        str = str.slice(1);
        str = skipSpaces(str);
        return [res,str];
    }
    while(true){
        if(str.length === 0)
            throw new Error("Unexpected end of input");
        let val;
        [val,str] = parseRNBT(str);
        res.push(val);
        if(str.length === 0)
            throw new Error("Unexpected end of input");
        if(str[0] === "]"){
            str = str.slice(1);
            str = skipSpaces(str);
            break;
        }else if(str[0] === ","){
            str = str.slice(1);
            str = skipSpaces(str);
            continue;
        }else{
            throw new Error(`Unexpected token ${str[0]} in a list`);
        }
    }
    return [res,str];
};

const parseString = function(str){
    let res = "";
    let i = 1;// skip "\""
    for(; i < str.length; i++){
        if(i ===str.length)
            throw new Error("Unclosed string at the end of file");
        if(str[i] === "\\"){
            i++;
            if(i === str.length)
                throw new Error("Unclosed string at the end of file");
            res += "\\"+str[i];
        }else if(str[i] === "\""){
            i++;
            break;
        }else{
            res += str[i];
        }
    }
    str = str.slice(i);
    str = skipSpaces(str);
    // JSON.parse handles all the escape sequences like "\u001a"
    return [JSON.parse("\""+res+"\""),str];
};

const parseNumberAsString = function(str){
    const res = str.match(/^[0-9\.\+\-eE]+/)[0];
    str = str.slice(res.length);
    str = skipSpaces(str);
    return [res,str];
};

const parseNumber = function(str,type){
    let val;
    [val,str] = parseNumberAsString(str);
    let num;
    if(type === TAG_Long){
        num = BigInt(val);
    }else if(type === TAG_Float || type === TAG_Double){
        num = parseFloat(val);
    }else{
        num = parseInt(val);
    }
    const res = new numberConstructors[type](num);
    return [res,str];
};

const parseNumberArray = function(str){
    str = str.slice(1);
    str = skipSpaces(str);
    const res = [];
    if(str[0] === "]"){
        str = str.slice(1);
        str = skipSpaces(str);
        return [res,str];
    }
    while(true){
        if(str.length === 0)
            throw new Error("Unexpected end of input");
        let val;
        [val,str] = parseNumberAsString(str);
        res.push(val);
        if(str.length === 0)
            throw new Error("Unexpected end of input");
        if(str[0] === "]"){
            str = str.slice(1);
            str = skipSpaces(str);
            break;
        }else if(str[0] === ","){
            str = str.slice(1);
            str = skipSpaces(str);
            continue;
        }else{
            throw new Error(`Unexpected token ${str[0]} in a typed array`);
        }
    }
    return [res,str];
};

const parseByteArray = function(str){
    let arr;
    [arr,str] = parseNumberArray(str);
    const res = new Int8Array(arr.length);
    for(let i = 0; i < arr.length; i++){
        res[i] = parseInt(arr[i]);
    }
    return [res,str];
};

const parseIntArray = function(str){
    let arr;
    [arr,str] = parseNumberArray(str);
    const res = new Int32Array(arr.length);
    for(let i = 0; i < arr.length; i++){
        res[i] = parseInt(arr[i]);
    }
    return [res,str];
};

const parseLongArray = function(str){
    let arr;
    [arr,str] = parseNumberArray(str);
    const res = new BigInt64Array(arr.length);
    for(let i = 0; i < arr.length; i++){
        res[i] = BigInt(arr[i]);
    }
    return [res,str];
};


const parseRNBT = function(str){// str contains sliced string
    if(str.length === 0)
        throw new Error("Unexpected end of input");
    str = skipSpaces(str);
    if(str[0] === "{")
        return parseCompound(str);
    if(str[0] === "[")
        return parseList(str);
    if(str[0] === "\"")
        return parseString(str);
    
    // Extract the typename
    const typename = str.match(/^[^\s]+/)[0];
    if(!typename){
        if(str.length !== 0){
            // Shouldn't happen, but just in case
            throw new Error(`Expected typename, but got ${str[0]} instead.`);
        }else{
            throw new Error("Unexpected end of input");
        }
    }
    if(!typenameMap.has(typename))
        throw new Error(`Expected a valid typename, but got ${typename.slice(0,10)} instead.`);
    str = str.slice(typename.length);
    str = skipSpaces(str);
    if(str.length === 0)
        throw new Error("Unexpected end of input");
    if(str[0] === "["){
        if(typename === typenames[TAG_Byte_Array])
            return parseByteArray(str);
        if(typename === typenames[TAG_Int_Array])
            return parseIntArray(str);
        if(typename === typenames[TAG_Long_Array])
            return parseLongArray(str);
        throw new Error(`${typename} typed array is not supported by NBT.`);
    }
    // It's a plain old number
    return parseNumber(str,typenameMap.get(typename));
};

export const decodeRNBT = function(str)/*:nbtobject*/{
    str = skipSpaces(str);
    let res;
    [res,str] = parseRNBT(str);
    if(str.length !== 0){
        if(str.length <= 50){
            throw new Error("Remaining input stream: ${str.slice(0,50)}");
        }else{
            throw new Error("Remaining input stream: ${str.slice(0,50)}...");
        }
    }
    return res;
};



