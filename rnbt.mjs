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

const encoders = [];
for(let type of [TAG_Byte, TAG_Short, TAG_Int, TAG_Float, TAG_Double]){
    encoders[type] = function(strb, nbt, indent, depth){
        strb.push(`${typenames[type]} ${nbt.value}`);
    };
}

/*encoders[TAG_Byte] = function(strb, nbt, indent, depth){
    strb.push(`${typenames[TAG_Byte]} ${nbt.value}`);
};
encoders[TAG_Short] = function(strb, nbt, indent, depth){
    strb.push(`${typenames[TAG_Short]} ${nbt.value}`);
};
encoders[TAG_Int] = function(strb, nbt, indent, depth){
    strb.push(`${typenames[TAG_Int]} ${nbt.value}`);
};*/
encoders[TAG_Long] = function(strb, nbt, indent, depth){
    strb.push(`${typenames[TAG_Long]} ${nbt.value}`);
};
/*encoders[TAG_Float] = function(strb, nbt, indent, depth){
    strb.push(`${typenames[TAG_Float]} ${nbt.value}`);
};
encoders[TAG_Double] = function(strb, nbt, indent, depth){
    strb.push(`${typenames[TAG_Double]} ${nbt.value}`);
};*/
encoders[TAG_Byte_Array] = function(strb, nbt, indent, depth){
    strb.push(`${typenames[TAG_Byte_Array]} ${JSON.stringify([...nbt])}`);
};
encoders[TAG_String] = function(strb, nbt, indent, depth){
    strb.push(JSON.stringify(nbt));
};
encoders[TAG_List] = function(strb, nbt, indent, depth){
    if(nbt.length === 0){
        strb.push(`[]`);
        return;
    }
    const type = getType(nbt[0]);
    const indentStr1 = getIndent(indent*(depth+1));
    const indentStr = getIndent(indent*depth);
    strb.push(`[\n`);
    let first = true;
    for(let item of nbt){
        if(first){
            first = false;
        }else{
            strb.push(`,\n`);
        }
        strb.push(indentStr1);
        encoders[type](strb, item, indent, depth+1);
    }
    strb.push(`\n`);
    strb.push(indentStr);
    strb.push(`]`);
};
encoders[TAG_Compound] = function(strb, nbt, indent, depth){
    if(isEmpty(nbt)){
        strb.push(`{}`);
        return;
    }
    const indentStr1 = getIndent(indent*(depth+1));
    const indentStr = getIndent(indent*depth);
    strb.push(`{\n`);
    let first = true;
    for(let key in nbt){
        if(first){
            first = false;
        }else{
            strb.push(`,\n`);
        }
        strb.push(indentStr1);
        strb.push(`${keyToString(key)}: `);
        const item = nbt[key];
        const type = getType(item);
        encoders[type](strb, item, indent, depth+1);
    }
    strb.push(`\n`);
    strb.push(indentStr);
    strb.push(`}`);
};
encoders[TAG_Int_Array] = function(strb, nbt, indent, depth){
    strb.push(`i32 ${JSON.stringify([...nbt])}`);
};
encoders[TAG_Long_Array] = function(strb, nbt, indent, depth){
    strb.push(`i64 ${JSON.stringify([...nbt])}`);
};

export const encodeRNBT = function(nbt/*:nbtobject*/,nl=true,indent=4){
    const strb = [];
    encoders[getType(nbt)](strb,nbt,indent,0);
    return strb.join("");
};




