import { withinBoundaries, normalizeAngleZero2TwoPI, angleSpan, convert2WorldSpace, invertFromWorldSpace } from "../../src/board-camera";

describe("withinBoundaries", () => {

    test("should return true if no boundaries", () => {
        expect(withinBoundaries({x: 0, y: 0}, undefined)).toBe(true);
    });

    test("should return true if point is within boundaries", () => {
        expect(withinBoundaries({x: 0, y: 0}, {min: {x: -1, y: -1}, max: {x: 1, y: 1}})).toBe(true);
    });

    test("should return false if point is outside boundaries", () => {
        expect(withinBoundaries({x: 0, y: 0}, {min: {x: 1, y: 1}, max: {x: 2, y: 2}})).toBe(false);
    });

    test("should still work if only one boundary is defined", () => {
        expect(withinBoundaries({x: 0, y: 0}, {min: {x: -1, y: -1}})).toBe(true);
        expect(withinBoundaries({x: 0, y: 0}, {max: {x: 1, y: 1}})).toBe(true);
        expect(withinBoundaries({x: 0, y: 0}, {min: {x: 1, y: 1}})).toBe(false);
        expect(withinBoundaries({x: 0, y: 0}, {max: {x: -1, y: -1}})).toBe(false);
    });

    test("should still work if only one axis is defined", () => {
        expect(withinBoundaries({x: 0, y: 0}, {min: {x: -1}})).toBe(true);
        expect(withinBoundaries({x: 0, y: 0}, {max: {x: 1}})).toBe(true);
        expect(withinBoundaries({x: 0, y: 0}, {min: {x: 1}})).toBe(false);
        expect(withinBoundaries({x: 0, y: 0}, {max: {x: -1}})).toBe(false);
    });
        
});

describe("normalizeAngleZero2TwoPI", () => {
    test("should return the same angle if it is already between 0 and 2PI", () => {
        expect(normalizeAngleZero2TwoPI(0)).toBe(0);
        expect(normalizeAngleZero2TwoPI(Math.PI)).toBe(Math.PI);
        expect(normalizeAngleZero2TwoPI(Math.PI * 2)).toBe(0);
    });

    test("should return the normalized angle if it is not between 0 and 2PI", () => {
        expect(normalizeAngleZero2TwoPI(-45 * Math.PI / 180)).toBeCloseTo(315 * Math.PI / 180);
        expect(normalizeAngleZero2TwoPI(-Math.PI)).toBe(Math.PI);
        expect(normalizeAngleZero2TwoPI(-Math.PI * 2)).toBe(0);
        expect(normalizeAngleZero2TwoPI(Math.PI * 3)).toBe(Math.PI);
        expect(normalizeAngleZero2TwoPI(Math.PI * 4)).toBe(0);
    });
});

describe("calculate the minimum angle span from an angle to another", () => {

    test("a full revolution meaning no angle span", () => {
        expect(angleSpan(0, Math.PI * 2)).toBe(0);
        expect(angleSpan(0, -Math.PI * 2)).toBe(0);
        expect(angleSpan(Math.PI * 2, Math.PI * 4)).toBe(0);
    });

    test("testing the angle span between 0 and 90 degrees", ()=>{
        expect(angleSpan(0, Math.PI / 2)).toBe(Math.PI / 2);
        expect(angleSpan(-Math.PI / 2, 0)).toBe(Math.PI / 2);
    });

    test("testing the angle span that rotating clockwise is smaller than rotating counter clockwise", ()=>{
        expect(angleSpan(0, 270 * Math.PI / 180)).toBeCloseTo(-90 * Math.PI / 180);
    });
});

describe("coordinate conversion", () => {
    test("Convert point within camera view to world space", ()=>{
        const testRes = convert2WorldSpace({x: 100, y: 100}, 1000, 1000, {x: 30, y: 50}, 10, -45 * Math.PI / 180);
        expect(testRes.x).toBeCloseTo(30 - (800 / (Math.sqrt(2) * 10)));
        expect(testRes.y).toBeCloseTo(50);
        const testRes2 = convert2WorldSpace({x: 100, y: 100}, 1000, 1000, {x: 10, y: 10}, 1, 0);
        expect(testRes2.x).toBeCloseTo(-390);
        expect(testRes2.y).toBeCloseTo(-390);
    });

    test("Convert point within world space to camera view", ()=>{
        const point = {x: 10, y: 30};
        const cameraCenterInViewPort = {x: 500, y: 500};
        const testRes = invertFromWorldSpace(point, 1000, 1000, {x: 30, y: 50}, 1, 0);
        expect(testRes.x).toBeCloseTo(cameraCenterInViewPort.x - 20);
        expect(testRes.y).toBeCloseTo(cameraCenterInViewPort.y - 20);
        const test2Point = {x: 10, y: 50};
        const testRes2 = invertFromWorldSpace(test2Point, 1000, 1000, {x: 30, y: 50}, 1, -45 * Math.PI / 180);
        const expectedRes = {x: 500 - 20 / Math.sqrt(2), y: 500 - 20 / Math.sqrt(2)};
        expect(testRes2.x).toBeCloseTo(expectedRes.x);
        expect(testRes2.y).toBeCloseTo(expectedRes.y);
    });
});
