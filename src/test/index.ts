import {test} from "@/test/toastTest";
import {testInit} from "@/test/commonUtilTest";
import {testHrOcr} from "@/test/ocrUtilTest";

async function main(){
    await testHrOcr()
}

main().catch(e => console.error(e));