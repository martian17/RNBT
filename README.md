# Readable NBT
This is a JSON like NBT format, dass ein Mensch lesen kann.  
Hier stellt ein beispiel
```json
{
    DataVersion: i32 3337,
    Status: "full",
    OCEAN_FLOOR: i64 [0, 0, 0, 0]
    structures: {
      References: {},
      starts: {}
    },
    X: i8 5,
    Y: i8 -2,
}
```
This format maps 1 to 1 with binary nbt data, and it could be used in place of chunk files as a configuration, to be converted on demand to to the binary NBT format.

For further examples and usages, have a look at the following:  
https://github.com/martian17/minecraft-wrapper-js/blob/main/assets/chunk-default.rnbt
