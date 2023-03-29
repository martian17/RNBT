// Util functions

export const obj_isEmpty = function(obj){
    for(let ket in obj){
        return false;
    }
    return true;
};

export const repeatstr = function(str,n){
    let ret = "";
    for(let i = 0; i < n; i++){
        ret += str;
    }
    return ret;
};

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
