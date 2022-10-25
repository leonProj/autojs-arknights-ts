import {init} from "@/utils/commonUtil";
import * as state from "@/state";

function testInit(){
    init()
    console.log('state.deviceInfo',state.deviceInfo)
}

export {
    testInit
}