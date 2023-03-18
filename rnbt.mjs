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
//types
    NBT_Byte,
    NBT_Short,
    NBT_Int,
    NBT_Long,
    NBT_Float,
    NBT_Double,
//funcs
    getType
} from "nbt.js";


const isEmpty = function(obj){
    for(let ket in obj){
        return false;
    }
    return true;
};

const repeatstr = function(str,n){
    let ret = "";
    for(let i = 0; i < n; i++){
        ret += str;
    }
    return ret;
};

const getIndent = (()=>{
    const cache = new Map;
    return function(n){
        if(!cache.has(n)){
            cache.set(n,repeatstr(" ",n));
        }
        return cache.get(n);
    }
    /*
    const caches = [];
    return function(span,level){
        if(caches.length <= span){
            for(let i = caches.length; i <= span; i++){
                caches.push([]);
            }
        }
        const cache = caches[span];
        if(cache.length <= level){
            for(let i = cache.length; i <= level; i++){
                cache.push(repeatstr(" ",span*level));
            }
        }
        return cache[span][level];
    }*/
})();

const keyToString = function(key){
    if(key.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)){
        return key;
    }else{
        return JSON.stringify(key);
    }
};



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

const getTypeName = function(type,{highlight}){
    if(!highlight)return typenames[type];
    return colors.type+typenames[type]+colors.reset;
};


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

const colors = {
    number: (str)=>{
        return _colors.yellow + str + _colors.reset;
    },
    string: (str)=>{
        return _colors.green + str + _colors.reset;
    },
    type: (str)=>{
        return _colors.red + str + _colors.reset;
    }
};


const encoders = [];
for(let type of [TAG_Byte, TAG_Short, TAG_Int, TAG_Float, TAG_Double]){
    encoders[type] = function(nbt){
        return colors.type(typenames[type]) + " " + colors.number(nbt.value);
    };
}
encoders[TAG_Long] = function(nbt){
    console.log(nbt);
    return colors.type(typenames[TAG_Long]) + " " + colors.number((nbt.value+""));
};

encoders[TAG_Byte_Array] = function(nbt){
    return colors.type(typenames[TAG_Byte_Array]) + " " + colors.number(JSON.stringify([...nbt]));
};
encoders[TAG_String] = function(nbt){
    return colors.string(JSON.stringify(nbt));
};
encoders[TAG_List] = function(nbt, indent, depth){
    if(nbt.length === 0){
        return "[]";
    }
    const type = getType(nbt[0]);
    const indentStr1 = getIndent(indent*(depth+1));
    const indentStr = getIndent(indent*depth);
    let res = "[\n";
    let first = true;
    for(let item of nbt){
        if(first){
            first = false;
        }else{
            res += ",\n";
        }
        res += indentStr1;
        res += encoders[type](item, indent, depth+1);
    }
    res += `\n${indentStr}]`;
    return res;
};
encoders[TAG_Compound] = function(nbt, indent, depth){
    if(isEmpty(nbt)){
        return "{}";
    }
    const indentStr1 = getIndent(indent*(depth+1));
    const indentStr = getIndent(indent*depth);
    let res = "{\n";
    let first = true;
    for(let key in nbt){
        if(first){
            first = false;
        }else{
            res += ",\n";
        }
        res += indentStr1;
        res += keyToString(key)+": ";
        const item = nbt[key];
        const type = getType(item);
        res += encoders[type](item, indent, depth+1);
    }
    res += "\n";
    res += indentStr;
    res += `}`;
    return res;
};
encoders[TAG_Int_Array] = function(nbt, indent, depth){
    return `i32 ${JSON.stringify([...nbt])}`;
};
encoders[TAG_Long_Array] = function(nbt, indent, depth){
    return `i64 ${JSON.stringify([...nbt])}`;
};

export const encodeRNBT = function(nbt/*:nbtobject*/,nl=true,indent=2){
    return encoders[getType(nbt)](nbt,indent,0);
};




