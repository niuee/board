import { Point } from "src";
import { calculateOrderOfMagnitude } from "src/util";
import { Boundaries } from "src/board-camera";
import { boundariesFullyDefined, translationHeightOf, translationWidthOf } from "src/board-camera/utils/position";
import { PointCal } from "point2point";

export function drawCrossHair(context: CanvasRenderingContext2D, pos: Point, cameraZoomLevel: number, alignCoordinateSystem: boolean, size: number, color: string = "red"): void{
    // size is the pixel shown in the viewport
    let halfSize = size / 2;
    halfSize = halfSize / cameraZoomLevel;
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 2 / cameraZoomLevel;
    if(alignCoordinateSystem){
        context.moveTo(pos.x - halfSize, pos.y);
        context.lineTo(pos.x + halfSize, pos.y);
        context.moveTo(pos.x, pos.y - halfSize);
        context.lineTo(pos.x, pos.y + halfSize);
    } else {
        context.moveTo(pos.x - halfSize, -pos.y);
        context.lineTo(pos.x + halfSize, -pos.y);
        context.moveTo(pos.x, -pos.y - halfSize);
        context.lineTo(pos.x, -pos.y + halfSize);
    }
    context.stroke();
    context.lineWidth = 3;
}

export function drawBoundingBox(context: CanvasRenderingContext2D, boundaries: Boundaries, alignCoordinateSystem: boolean): void{
    if(!boundariesFullyDefined(boundaries)){
        return;
    }
    const width = translationWidthOf(boundaries);
    const height = translationHeightOf(boundaries);
    const curMin = boundaries == undefined ? undefined: boundaries.min;
    const curMinX = curMin == undefined ? undefined: curMin.x;
    const curMinY = curMin == undefined ? undefined: curMin.y;
    if(curMinX == undefined || curMinY == undefined || width == undefined || height == undefined){
        return;
    }
    context.beginPath();
    context.strokeStyle = "blue";
    context.lineWidth = 100;
    if(alignCoordinateSystem){
        context.roundRect(curMinX, curMinY,  width, height, 5);
    } else {
        context.roundRect(curMinX, -curMinY, width, -height, 5);
    }
    context.stroke();
    context.lineWidth = 3;
    context.strokeStyle = "black";
}

export function drawAxis(context: CanvasRenderingContext2D, boundaries: Boundaries, zoomLevel: number, alignCoordinateSystem: boolean): void{
    if(!boundariesFullyDefined(boundaries)){
        // one of the direction is not defined
        return;
    }
    const width = translationWidthOf(boundaries);
    const height = translationHeightOf(boundaries);
    const curMin = boundaries == undefined ? undefined: boundaries.min;
    const curMinX = curMin == undefined ? undefined: curMin.x;
    const curMinY = curMin == undefined ? undefined: curMin.y;
    if(curMinX == undefined || curMinY == undefined || width == undefined || height == undefined){
        return;
    }
    context.lineWidth = 1 / zoomLevel;
    // y axis
    context.beginPath();
    context.strokeStyle = `rgba(87, 173, 72, 0.8)`;
    context.moveTo(0, 0);
    if(alignCoordinateSystem){
        context.lineTo(0, curMinY + (height));
    } else {
        context.lineTo(0, -curMinY - (height));
    }
    context.stroke();
    
    // x axis
    context.beginPath();
    context.strokeStyle = `rgba(220, 59, 59, 0.8)`;
    context.moveTo(0, 0);
    context.lineTo(curMinX + width, 0);
    context.stroke();
    context.strokeStyle = "black";
}

// argument points are in world space
export function drawGrid(context: CanvasRenderingContext2D, topLeftCorner: Point, topRightCorner: Point, bottomLeftCorner: Point, bottomRightCorner: Point, alignCoordinateSystem: boolean, cameraZoomLevel: number, viewPortWidth: number, viewPortHeight: number): void{
    // let topLeftCorner = {y: this._canvas.getBoundingClientRect().top, x: this._canvas.getBoundingClientRect().left};
    // topLeftCorner = this.convertWindowPoint2WorldCoord(topLeftCorner);
    // let topRightCorner = {y: this._canvas.getBoundingClientRect().top, x: this._canvas.getBoundingClientRect().right};
    // topRightCorner = this.convertWindowPoint2WorldCoord(topRightCorner);
    // let bottomLeftCorner = {y: this._canvas.getBoundingClientRect().bottom, x: this._canvas.getBoundingClientRect().left};
    // bottomLeftCorner = this.convertWindowPoint2WorldCoord(bottomLeftCorner);
    // let bottomRightCorner = {y: this._canvas.getBoundingClientRect().bottom, x: this._canvas.getBoundingClientRect().right};
    // bottomRightCorner = this.convertWindowPoint2WorldCoord(bottomRightCorner);
    let leftRightDirection = PointCal.unitVectorFromA2B(topLeftCorner, topRightCorner);
    let topDownDirection = PointCal.unitVectorFromA2B(bottomLeftCorner, topLeftCorner);
    let width = PointCal.distanceBetweenPoints(topLeftCorner, topRightCorner);
    let orderOfMagnitude = calculateOrderOfMagnitude(width);
    let divisor = Math.pow(10, orderOfMagnitude);
    let subDivisor = divisor / 10;
    let minHorizontalSmallTick = Math.ceil(topLeftCorner.x / subDivisor) * subDivisor;
    let maxHorizontalSmallTick = Math.floor(topRightCorner.x / subDivisor) * subDivisor;
    let minVerticalSmallTick = alignCoordinateSystem ? Math.floor(topLeftCorner.y / subDivisor) * subDivisor : Math.ceil(bottomLeftCorner.y / subDivisor) * subDivisor;
    let maxVerticalSmallTick = alignCoordinateSystem ? Math.ceil(bottomLeftCorner.y / subDivisor) * subDivisor : Math.floor(topLeftCorner.y / subDivisor) * subDivisor;;

    for(let i = minHorizontalSmallTick; i <= maxHorizontalSmallTick; i += subDivisor){
        context.beginPath();
        context.strokeStyle = "black";
        context.fillStyle = "black";
        context.lineWidth = 0.5 / cameraZoomLevel;
        if(alignCoordinateSystem){
            context.moveTo(i, topLeftCorner.y);
            context.lineTo(i, topLeftCorner.y + viewPortHeight / cameraZoomLevel);
        } else {
            context.moveTo(i, -topLeftCorner.y);
            context.lineTo(i, -topLeftCorner.y + viewPortHeight / cameraZoomLevel);
        }
        context.stroke();
    }
    for(let i = minVerticalSmallTick; i <= maxVerticalSmallTick; i += subDivisor){
        context.beginPath();
        context.strokeStyle = "black";
        context.fillStyle = "black";
        context.lineWidth = 0.5 / cameraZoomLevel;
        if(!alignCoordinateSystem){
            context.moveTo(topLeftCorner.x, -i);
            context.lineTo(topLeftCorner.x + width / cameraZoomLevel, -i);
        } else {
            context.moveTo(topLeftCorner.x, i);
            context.lineTo(topLeftCorner.x + width / cameraZoomLevel, i);
        }
        context.stroke();
    }
}

// argument points are in world space
export function drawRuler(context: CanvasRenderingContext2D, topLeftCorner: Point, topRightCorner: Point, bottomLeftCorner: Point, bottomRightCorner: Point, alignCoordinateSystem: boolean, cameraZoomLevel: number): void{
        // let topLeftCorner = {y: this._canvas.getBoundingClientRect().top, x: this._canvas.getBoundingClientRect().left};
        // topLeftCorner = this.convertWindowPoint2WorldCoord(topLeftCorner);
        // let topRightCorner = {y: this._canvas.getBoundingClientRect().top, x: this._canvas.getBoundingClientRect().right};
        // topRightCorner = this.convertWindowPoint2WorldCoord(topRightCorner);
        // let bottomLeftCorner = {y: this._canvas.getBoundingClientRect().bottom, x: this._canvas.getBoundingClientRect().left};
        // bottomLeftCorner = this.convertWindowPoint2WorldCoord(bottomLeftCorner);
        // let bottomRightCorner = {y: this._canvas.getBoundingClientRect().bottom, x: this._canvas.getBoundingClientRect().right};
        // bottomRightCorner = this.convertWindowPoint2WorldCoord(bottomRightCorner);
        let leftRightDirection = PointCal.unitVectorFromA2B(topLeftCorner, topRightCorner);
        let topDownDirection = PointCal.unitVectorFromA2B(bottomLeftCorner, topLeftCorner);
        let width = PointCal.distanceBetweenPoints(topLeftCorner, topRightCorner);
        let orderOfMagnitude = calculateOrderOfMagnitude(width);
        let divisor = Math.pow(10, orderOfMagnitude);
        let halfDivisor = divisor / 2;
        let subDivisor = divisor / 10;
        let minHorizontalLargeTick = Math.ceil(topLeftCorner.x / divisor) * divisor;
        let maxHorizontalLargeTick = Math.floor(topRightCorner.x / divisor) * divisor;
        let minVerticalLargeTick = alignCoordinateSystem ? Math.ceil(topLeftCorner.y / divisor) * divisor : Math.floor(bottomLeftCorner.y / divisor) * divisor;
        let maxVerticalLargeTick = alignCoordinateSystem ? Math.floor(bottomLeftCorner.y / divisor) * divisor : Math.ceil(topLeftCorner.y / divisor) * divisor;
        let minHorizontalMediumTick = Math.ceil(topLeftCorner.x / halfDivisor) * halfDivisor;
        let maxHorizontalMediumTick = Math.floor(topRightCorner.x / halfDivisor) * halfDivisor;
        let minVerticalMediumTick = alignCoordinateSystem ? Math.ceil(topLeftCorner.y / halfDivisor) * halfDivisor : Math.floor(bottomLeftCorner.y / halfDivisor) * halfDivisor;
        let maxVerticalMediumTick = alignCoordinateSystem ? Math.floor(bottomLeftCorner.y / halfDivisor) * halfDivisor : Math.ceil(topLeftCorner.y / halfDivisor) * halfDivisor;
        let minHorizontalSmallTick = Math.ceil(topLeftCorner.x / subDivisor) * subDivisor;
        let maxHorizontalSmallTick = Math.floor(topRightCorner.x / subDivisor) * subDivisor;
        let minVerticalSmallTick = alignCoordinateSystem ? Math.ceil(topLeftCorner.y / subDivisor) * subDivisor : Math.floor(bottomLeftCorner.y / subDivisor) * subDivisor;
        let maxVerticalSmallTick = alignCoordinateSystem ? Math.floor(bottomLeftCorner.y / subDivisor) * subDivisor : Math.ceil(topLeftCorner.y / subDivisor) * subDivisor;
       
        let divisorInActualPixel = divisor * cameraZoomLevel;
        let halfDivisorInActualPixel = halfDivisor * cameraZoomLevel;
        let subDivisorInActualPixel = subDivisor * cameraZoomLevel;

        
        context.font = `bold ${20 / cameraZoomLevel}px Helvetica`;
        const midBaseLineTextDimensions = context.measureText(`${-(halfDivisor + minHorizontalMediumTick)}`);
        const midBaseLineHeight =  midBaseLineTextDimensions.fontBoundingBoxAscent + midBaseLineTextDimensions.fontBoundingBoxDescent;
        const subBaseLineTextDimensions = context.measureText(`${-(subDivisor + minHorizontalSmallTick)}`);
        const subBaseLineHeight = subBaseLineTextDimensions.fontBoundingBoxAscent + subBaseLineTextDimensions.fontBoundingBoxDescent;

        for(let i = minHorizontalLargeTick; i <= maxHorizontalLargeTick; i += divisor){
            context.beginPath();
            context.strokeStyle = "black";
            context.fillStyle = "black";
            context.lineWidth = 5 / cameraZoomLevel;
            let resPoint = PointCal.addVector({x: i, y: topLeftCorner.y}, PointCal.multiplyVectorByScalar(topDownDirection, 50 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.moveTo(resPoint.x, -resPoint.y);
            } else {
                context.moveTo(resPoint.x, resPoint.y);
            }
            resPoint = PointCal.addVector({x: i, y: topLeftCorner.y}, PointCal.multiplyVectorByScalar(topDownDirection, -50 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.lineTo(resPoint.x, -resPoint.y);
            } else {
                context.lineTo(resPoint.x, resPoint.y);
            }
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = `bold ${20 / cameraZoomLevel}px Helvetica`;
            const textDimensions = context.measureText(`${i.toFixed(0)}`);
            const height = textDimensions.fontBoundingBoxAscent + textDimensions.fontBoundingBoxDescent;
            if(!alignCoordinateSystem){
                resPoint = PointCal.addVector(resPoint, {x: 0, y: -height / 2 - height * 0.2})
                context.fillText(`${i.toFixed(0)}`, resPoint.x , -resPoint.y);
            } else {
                resPoint = PointCal.addVector(resPoint, {x: 0, y: height / 2 + height * 0.2})
                context.fillText(`${i.toFixed(0)}`, resPoint.x , resPoint.y);
            }
            context.stroke();
        }
        for(let i = minVerticalLargeTick; i <= maxVerticalLargeTick; i += divisor){
            context.beginPath();
            context.strokeStyle = "black";
            context.fillStyle = "black";
            context.lineWidth = 5 / cameraZoomLevel;
            let resPoint = PointCal.addVector({x: topLeftCorner.x, y: i}, PointCal.multiplyVectorByScalar(leftRightDirection, -50 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.moveTo(resPoint.x, -resPoint.y);
            } else {
                context.moveTo(resPoint.x, resPoint.y);
            }
            resPoint = PointCal.addVector({x: topLeftCorner.x, y: i}, PointCal.multiplyVectorByScalar(leftRightDirection, 50 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.lineTo(resPoint.x, -resPoint.y);
            } else {
                context.lineTo(resPoint.x, resPoint.y);
            }
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = `bold ${20 / cameraZoomLevel}px Helvetica`;
            
            const textDimensions = context.measureText(`${i.toFixed(0)}`);
            resPoint = PointCal.addVector(resPoint, {x: textDimensions.width / 2 + textDimensions.width * 0.3, y: 0});
            if(!alignCoordinateSystem){
                context.fillText(`${i.toFixed(0)}`, resPoint.x, -resPoint.y);
            } else {
                context.fillText(`${i.toFixed(0)}`, resPoint.x, resPoint.y);
            }
            context.stroke();
        }
        for(let i = minHorizontalMediumTick; i <= maxHorizontalMediumTick; i += halfDivisor){
            if(i % divisor == 0) continue;
            context.beginPath();
            context.strokeStyle = "black";
            context.fillStyle = "black";
            context.lineWidth = 3 / cameraZoomLevel;
            let resPoint = PointCal.addVector({x: i, y: topLeftCorner.y}, PointCal.multiplyVectorByScalar(topDownDirection, 25 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.moveTo(resPoint.x, -resPoint.y);
            } else {
                context.moveTo(resPoint.x, resPoint.y);
            }
            resPoint = PointCal.addVector({x: i, y: topLeftCorner.y}, PointCal.multiplyVectorByScalar(topDownDirection, -25 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.lineTo(resPoint.x, -resPoint.y);
            } else {
                context.lineTo(resPoint.x, resPoint.y);
            }
            context.font = `${15 / cameraZoomLevel}px Helvetica`;
            const textDimensions = context.measureText(`${i.toFixed(0)}`);
            if(halfDivisorInActualPixel > midBaseLineTextDimensions.width * 2) {
                context.textAlign = "center";
                context.textBaseline = "middle";
                const height = textDimensions.fontBoundingBoxAscent + textDimensions.fontBoundingBoxDescent;
                if(!alignCoordinateSystem){
                    resPoint = PointCal.addVector(resPoint, {x: 0, y: -height / 2 - height * 0.2});
                    resPoint = PointCal.flipYAxis(resPoint);
                } else {
                    resPoint = PointCal.addVector(resPoint, {x: 0, y: height / 2 + height * 0.2});
                }
                context.fillText(`${i.toFixed(0)}`, resPoint.x , resPoint.y);
            }
            context.stroke();
        }
        for(let i = minVerticalMediumTick; i <= maxVerticalMediumTick; i += halfDivisor){
            if(i % divisor == 0) continue;
            context.beginPath();
            context.strokeStyle = "black";
            context.fillStyle = "black";
            context.lineWidth = 3 / cameraZoomLevel;
            let resPoint = PointCal.addVector({x: topLeftCorner.x, y: i}, PointCal.multiplyVectorByScalar(leftRightDirection, -25 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.moveTo(resPoint.x, -resPoint.y);
            } else {
                context.moveTo(resPoint.x, resPoint.y);
            }
            resPoint = PointCal.addVector({x: topLeftCorner.x, y: i}, PointCal.multiplyVectorByScalar(leftRightDirection, 25 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.lineTo(resPoint.x, -resPoint.y);
            } else {
                context.lineTo(resPoint.x, resPoint.y);
            }
            context.font = `${18 / cameraZoomLevel}px Helvetica`;
            const textDimensions = context.measureText(`${i.toFixed(0)}`);
            const height = textDimensions.fontBoundingBoxAscent + textDimensions.fontBoundingBoxDescent;
            if(halfDivisorInActualPixel > midBaseLineHeight * 2) {
                context.textAlign = "center";
                context.textBaseline = "middle";
                resPoint = PointCal.addVector(resPoint, {x: textDimensions.width / 2 + textDimensions.width * 0.3, y: 0});
                if(!alignCoordinateSystem){
                    resPoint = PointCal.flipYAxis(resPoint);
                }
                context.fillText(`${i.toFixed(0)}`, resPoint.x, resPoint.y );
            }
            context.stroke();
        }
        for(let i = minHorizontalSmallTick; i <= maxHorizontalSmallTick; i += subDivisor){
            if(i % divisor == 0 || i % halfDivisor == 0) continue;
            context.beginPath();
            context.strokeStyle = "black";
            context.fillStyle = "black";
            context.lineWidth = 1 / cameraZoomLevel;
            let resPoint = PointCal.addVector({x: i, y: topLeftCorner.y}, PointCal.multiplyVectorByScalar(topDownDirection, 12.5 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.moveTo(resPoint.x, -resPoint.y);
            } else {
                context.moveTo(resPoint.x, resPoint.y);
            }
            resPoint = PointCal.addVector({x: i, y: topLeftCorner.y}, PointCal.multiplyVectorByScalar(topDownDirection, -12.5 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.lineTo(resPoint.x, -resPoint.y);
            } else {
                context.lineTo(resPoint.x, resPoint.y);
            }
            context.font = `${10 / cameraZoomLevel}px Helvetica`;
            const textDimensions = context.measureText(`${i.toFixed(0)}`);
            if(subDivisorInActualPixel > subBaseLineTextDimensions.width * 2) {
                context.textAlign = "center";
                context.textBaseline = "middle";
                const height = textDimensions.fontBoundingBoxAscent + textDimensions.fontBoundingBoxDescent;
                if(!alignCoordinateSystem){
                    resPoint = PointCal.addVector(resPoint, {x: 0, y: -height / 2 - height * 0.2});
                    resPoint = PointCal.flipYAxis(resPoint);
                } else {
                    resPoint = PointCal.addVector(resPoint, {x: 0, y: height / 2 + height * 0.2});
                }
                context.fillText(`${i.toFixed(0)}`, resPoint.x , resPoint.y);
            }
            context.stroke();
        }
        for(let i = minVerticalSmallTick; i <= maxVerticalSmallTick; i += subDivisor){
            if(i % divisor == 0 || i % halfDivisor == 0) continue;
            context.beginPath();
            context.strokeStyle = "black";
            context.fillStyle = "black";
            context.lineWidth = 1 / cameraZoomLevel;
            let resPoint = PointCal.addVector({x: topLeftCorner.x, y: i}, PointCal.multiplyVectorByScalar(leftRightDirection, -12.5 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.moveTo(resPoint.x, -resPoint.y);
            } else {
                context.moveTo(resPoint.x, resPoint.y);
            }
            resPoint = PointCal.addVector({x: topLeftCorner.x, y: i}, PointCal.multiplyVectorByScalar(leftRightDirection, 12.5 / cameraZoomLevel));
            if(!alignCoordinateSystem){
                context.lineTo(resPoint.x, -resPoint.y);
            } else {
                context.lineTo(resPoint.x, resPoint.y);
            }
            context.font = `${12 / cameraZoomLevel}px Helvetica`;
            const textDimensions = context.measureText(`${i.toFixed(0)}`);
            const height = textDimensions.fontBoundingBoxAscent + textDimensions.fontBoundingBoxDescent;
            if(subDivisorInActualPixel > subBaseLineHeight * 2) {
                context.textAlign = "center";
                context.textBaseline = "middle";
                resPoint = PointCal.addVector(resPoint, {x: textDimensions.width / 2 + textDimensions.width * 0.3, y: 0});
                if(!alignCoordinateSystem){
                    resPoint = PointCal.flipYAxis(resPoint);
                }
                context.fillText(`${i.toFixed(0)}`, resPoint.x, resPoint.y );
            }
            context.stroke();
        }
}


export function drawPositionText(context: CanvasRenderingContext2D, pos: Point, cameraZoomLevel: number, alignCoordinateSystem: boolean, offset: number = 20, color: string="red"): void{
    offset = offset / cameraZoomLevel; 
    context.font = `${20 / cameraZoomLevel}px Arial`;
    context.fillStyle = color;
    if(alignCoordinateSystem){
        context.fillText(`x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}`, pos.x + offset, pos.y + offset);
    } else {
        context.fillText(`x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}`, pos.x + offset, -pos.y - offset);
    }
    context.fillStyle = "black";
}


export function drawReferenceCircle(context: CanvasRenderingContext2D, pos: Point, alignCoordinateSystem: boolean): void {
    context.beginPath();
    context.strokeStyle = `rgba(87, 173, 72, 0.8)`;
    // context.moveTo(pos.x, -pos.y);
    if(alignCoordinateSystem){
        context.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
    } else {
        context.arc(pos.x, -pos.y, 5, 0, 2 * Math.PI);
    }
    context.stroke();
    context.strokeStyle = "black";
}
