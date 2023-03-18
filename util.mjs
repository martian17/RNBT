// Util functions

export const obj_isEmpty = function(obj){
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

export const getIndent = (()=>{
    const cache = new Map;
    return function(n){
        if(!format.format)return "";
        if(!cache.has(n*format.indent)){
            cache.set(n*format.indent,repeatstr(" ",n));
        }
        return cache.get(n*format.indent);
    }
})();

export const escapeObjectKey = function(key){
    if(key.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)){
        return key;
    }else{
        return JSON.stringify(key);
    }
};

export const skipSpaces = function(str){
    return str.slice(str.match(/^\s*/)[0].length);
};
