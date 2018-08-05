import test from "ava";
import {getLogger} from "../src/utils/logger";

test('default getLogger', async t => {
    const logger = getLogger(null);
    logger('message 1', (message: any) => {
        t.fail(`get a value: ${message}`)
    });
    await Promise.resolve().then(() => {
        t.pass()
    })
});

test('cMessage test', async t => {
    let result: any = null;
    const logger = getLogger((...args: any[]) => result = args);

    logger('m1', () => {});
    t.deepEqual(result, [undefined]);
    result = null;

    const constString = '__CONST_STRING';
    logger('m2', () => constString);
    t.deepEqual(result, [constString]);
    result = null;

    logger('m3', (m: any) => m);
    t.deepEqual(result, ['m3']);
    result = null;

    logger({m: 'm4'}, JSON.stringify);
    t.deepEqual(result, ['{"m":"m4"}']);
    result = null;

    logger('m5', 'm5 ex', JSON.stringify);
    t.deepEqual(result, ['"m5"', 'm5 ex']);
    result = null
});
