"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHoliday = exports.updateHoliday = exports.createHoliday = exports.getHoliday = exports.getAllHolidays = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const holidayService = __importStar(require("../services/holiday.service"));
exports.getAllHolidays = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await holidayService.getAllHolidays();
    res.status(200).json({ status: 'success', data });
});
exports.getHoliday = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await holidayService.getHolidayById(req.params.id);
    res.status(200).json({ status: 'success', data });
});
exports.createHoliday = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await holidayService.createHoliday(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.updateHoliday = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await holidayService.updateHoliday(req.params.id, req.body);
    res.status(200).json({ status: 'success', data });
});
exports.deleteHoliday = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await holidayService.deleteHoliday(req.params.id);
    res.status(204).send();
});
