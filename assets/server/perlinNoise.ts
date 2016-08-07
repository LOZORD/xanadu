// Perlin noise algorithm derived from here
// http://webstaff.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf

import * as _ from 'lodash';

export type Vector = { x: number, y: number };

export function dotProduct(pa: Vector, pb: Vector): number {
    return pa.x * pb.x + pa.y * pb.y;
}

export function generateRandomUnitVector(): Vector {
    // Choose one of 16 directions
    const rand = _.random(0, 15);

    // Translate into radians
    const theta = rand / 8 * Math.PI;

    return { x: Math.cos(theta), y: Math.sin(theta) };
}

export function makeGradientGrid(size: number): Vector[][] {
    return _.range(size).map(r => _.range(size).map(generateRandomUnitVector))
}

// Smooth function for calculating noise
function smooth(t: number) {
    return 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
}

export function getValueForPoint(gradientGrid: Vector[][], p: Vector): number {
    // left gradient
    const i = Math.floor(p.x);
    const j = Math.floor(p.y);

    // Calculate local offsets
    const u = p.x - i;
    const  v = p.y - j;

    // Grab 4 corner gradient vectors
    const g00 = gradientGrid[i][j];
    const g01 = gradientGrid[i][j + 1];
    const g10 = gradientGrid[i + 1][j];
    const g11 = gradientGrid[i + 1][j + 1];

    // Calculate dot products for p's offset from
    // all 4 corners.
    const n00 = dotProduct(g00, { x: u, y: v });
    const n10 = dotProduct(g10, { x: u - 1, y: v });
    const n01 = dotProduct(g01, { x: u, y: v - 1 });
    const n11 = dotProduct(g11, { x: u - 1, y: v - 1 });

    // Combine the the smooth function on the u and v offsets
    // that are scaled by the dot products
    const nx0 = n00 * (1 - smooth(u)) + n10 * smooth(u);
    const nx1 = n01 * (1 - smooth(u)) + n11 * smooth(u);

    return nx0 * (1 - smooth(v)) + nx1 * smooth(v);
}
