/**
 * Point
 * @typedef {Object} Point
 * @property {number} x - Point X coordinate
 * @property {number} y - Point Y coordinate
 * @property {number} z - Point Z coordinate
 */

/**
 * Transformation
 * @typedef {Object} Transformation
 * @property {"translate" | "rotate" | "scale"} type - Type of translation
 * @property {number} startTime - Start time, in seconds (used only in animations)
 * @property {number} endTime - Start time, in seconds (used only in animations)
 * @property {number} distance - Distance to be made, in grades or distance units (used only in animations)
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate
 * @property {number} angle - Rotation angle (used only in rotations)
 * @property {string} axis - Rotation axis (used only in rotations)
 */
