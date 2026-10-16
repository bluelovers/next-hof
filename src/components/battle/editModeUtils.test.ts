/**
 * editModeUtils 座標與百分比格式化測試
 * editModeUtils coordinate & percentage formatting tests
 *
 * 驗證補零格式：座標前補 0 至 4 位、百分比固定 00.0 格式。
 * Verifies the zero-padded formats: coordinates padded to 4 digits, percentages fixed at 00.0.
 */
import { describe, it, expect } from 'vitest';
import { formatFrameCoordinate, formatRelativePercent } from './editModeUtils';

describe('formatFrameCoordinate', () =>
{
	it('前補 0 至 4 位', () =>
	{
		expect(formatFrameCoordinate(0)).toBe('0000');
		expect(formatFrameCoordinate(24)).toBe('0024');
		expect(formatFrameCoordinate(264)).toBe('0264');
	});

	it('超過 4 位不截斷', () =>
	{
		expect(formatFrameCoordinate(1234)).toBe('1234');
		expect(formatFrameCoordinate(56789)).toBe('56789');
	});

	it('負值保留負號且數字仍補至 4 位（防禦性）', () =>
	{
		expect(formatFrameCoordinate(-3)).toBe('-0003');
	});

	it('小數先四捨五入再補零', () =>
	{
		expect(formatFrameCoordinate(24.4)).toBe('0024');
		expect(formatFrameCoordinate(24.6)).toBe('0025');
	});
});

describe('formatRelativePercent', () =>
{
	it('整數部分補 0 至 2 位並固定 1 位小數', () =>
	{
		expect(formatRelativePercent({ x: 3.1, y: 12.5 })).toBe('03.1%, 12.5%');
		expect(formatRelativePercent({ x: 0, y: 40 })).toBe('00.0%, 40.0%');
	});

	it('滿百與超過百不截斷', () =>
	{
		expect(formatRelativePercent({ x: 100, y: 99.9 })).toBe('100.0%, 99.9%');
	});
});
