import {
    ChartConfigDimension,
    ChartConfigMode,
    DimensionConfig,
    DimensionType,
} from '../types/common.types';
import { QueryColumn } from '../types/ts-to-chart-event.types';
import {
    fetchQueryColumns,
    fetchQueryColumnsFromDimensionConfig,
} from './chart-config';

describe('fetchQueryColumnsFromDimensionConfig', () => {
    const mockColumn1 = {
        id: 'col1',
        name: 'Column 1',
    } as QueryColumn;

    const mockColumn2 = {
        id: 'col2',
        name: 'Column 2',
    } as QueryColumn;

    const mockColumn3 = {
        id: 'col3',
        name: 'Column 3',
    } as QueryColumn;

    const mockColumn4 = {
        id: 'col4',
        name: 'Column 4',
    } as QueryColumn;

    describe('FLAT dimension type', () => {
        it('should return single column in an array for FLAT dimension', () => {
            const flatConfig: DimensionConfig = {
                type: DimensionType.FLAT,
                column: mockColumn1,
            };

            const result = fetchQueryColumnsFromDimensionConfig(flatConfig);

            expect(result).toEqual([mockColumn1]);
            expect(result).toHaveLength(1);
        });
    });

    describe('MERGED dimension type', () => {
        it('should return all columns for MERGED dimension', () => {
            const mergedConfig: DimensionConfig = {
                type: DimensionType.MERGED,
                columns: [mockColumn1, mockColumn2],
            };

            const result = fetchQueryColumnsFromDimensionConfig(mergedConfig);

            expect(result).toEqual([mockColumn1, mockColumn2]);
            expect(result).toHaveLength(2);
        });

        it('should return empty array for MERGED dimension with no columns', () => {
            const mergedConfig: DimensionConfig = {
                type: DimensionType.MERGED,
                columns: [],
            };

            const result = fetchQueryColumnsFromDimensionConfig(mergedConfig);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should return multiple columns for MERGED dimension', () => {
            const mergedConfig: DimensionConfig = {
                type: DimensionType.MERGED,
                columns: [mockColumn1, mockColumn2, mockColumn3, mockColumn4],
            };

            const result = fetchQueryColumnsFromDimensionConfig(mergedConfig);

            expect(result).toEqual([
                mockColumn1,
                mockColumn2,
                mockColumn3,
                mockColumn4,
            ]);
            expect(result).toHaveLength(4);
        });
    });

    describe('DUAL dimension type', () => {
        it('should return columns from both primary and secondary FLAT dimensions', () => {
            const dualConfig: DimensionConfig = {
                type: DimensionType.DUAL,
                primary: {
                    type: DimensionType.FLAT,
                    column: mockColumn1,
                },
                secondary: {
                    type: DimensionType.FLAT,
                    column: mockColumn2,
                },
            };

            const result = fetchQueryColumnsFromDimensionConfig(dualConfig);

            expect(result).toEqual([mockColumn1, mockColumn2]);
            expect(result).toHaveLength(2);
        });

        it('should return columns from FLAT primary and MERGED secondary', () => {
            const dualConfig: DimensionConfig = {
                type: DimensionType.DUAL,
                primary: {
                    type: DimensionType.FLAT,
                    column: mockColumn1,
                },
                secondary: {
                    type: DimensionType.MERGED,
                    columns: [mockColumn2, mockColumn3],
                },
            };

            const result = fetchQueryColumnsFromDimensionConfig(dualConfig);

            expect(result).toEqual([mockColumn1, mockColumn2, mockColumn3]);
            expect(result).toHaveLength(3);
        });

        it('should return columns from MERGED primary and FLAT secondary', () => {
            const dualConfig: DimensionConfig = {
                type: DimensionType.DUAL,
                primary: {
                    type: DimensionType.MERGED,
                    columns: [mockColumn1, mockColumn2],
                },
                secondary: {
                    type: DimensionType.FLAT,
                    column: mockColumn3,
                },
            };

            const result = fetchQueryColumnsFromDimensionConfig(dualConfig);

            expect(result).toEqual([mockColumn1, mockColumn2, mockColumn3]);
            expect(result).toHaveLength(3);
        });

        it('should return columns from both MERGED primary and MERGED secondary', () => {
            const dualConfig: DimensionConfig = {
                type: DimensionType.DUAL,
                primary: {
                    type: DimensionType.MERGED,
                    columns: [mockColumn1, mockColumn2],
                },
                secondary: {
                    type: DimensionType.MERGED,
                    columns: [mockColumn3, mockColumn4],
                },
            };

            const result = fetchQueryColumnsFromDimensionConfig(dualConfig);

            expect(result).toEqual([
                mockColumn1,
                mockColumn2,
                mockColumn3,
                mockColumn4,
            ]);
            expect(result).toHaveLength(4);
        });

        it('should handle empty MERGED dimensions in DUAL config', () => {
            const dualConfig: DimensionConfig = {
                type: DimensionType.DUAL,
                primary: {
                    type: DimensionType.MERGED,
                    columns: [],
                },
                secondary: {
                    type: DimensionType.MERGED,
                    columns: [],
                },
            };

            const result = fetchQueryColumnsFromDimensionConfig(dualConfig);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });
});

describe('fetchQueryColumns', () => {
    const mockColumn1 = {
        id: 'col1',
        name: 'Column 1',
    } as QueryColumn;

    const mockColumn2 = {
        id: 'col2',
        name: 'Column 2',
    } as QueryColumn;

    const mockColumn3 = {
        id: 'col3',
        name: 'Column 3',
    } as QueryColumn;

    const mockColumn4 = {
        id: 'col4',
        name: 'Column 4',
    } as QueryColumn;

    describe('COLUMN_DRIVEN mode', () => {
        it('should return columns directly for COLUMN_DRIVEN dimension', () => {
            const dimension: ChartConfigDimension = {
                key: 'xAxis',
                mode: ChartConfigMode.COLUMN_DRIVEN,
                columns: [mockColumn1, mockColumn2],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([mockColumn1, mockColumn2]);
            expect(result).toHaveLength(2);
        });

        it('should return empty array for COLUMN_DRIVEN dimension with no columns', () => {
            const dimension: ChartConfigDimension = {
                key: 'xAxis',
                mode: ChartConfigMode.COLUMN_DRIVEN,
                columns: [],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should return single column for COLUMN_DRIVEN dimension', () => {
            const dimension: ChartConfigDimension = {
                key: 'xAxis',
                mode: ChartConfigMode.COLUMN_DRIVEN,
                columns: [mockColumn1],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([mockColumn1]);
            expect(result).toHaveLength(1);
        });
    });

    describe('CONFIG_DRIVEN mode', () => {
        it('should extract columns from single FLAT config', () => {
            const dimension: ChartConfigDimension = {
                key: 'xAxis',
                mode: ChartConfigMode.CONFIG_DRIVEN,
                config: [
                    {
                        type: DimensionType.FLAT,
                        column: mockColumn1,
                    },
                ],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([mockColumn1]);
            expect(result).toHaveLength(1);
        });

        it('should extract columns from single MERGED config', () => {
            const dimension: ChartConfigDimension = {
                key: 'yAxis',
                mode: ChartConfigMode.CONFIG_DRIVEN,
                config: [
                    {
                        type: DimensionType.MERGED,
                        columns: [mockColumn1, mockColumn2],
                    },
                ],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([mockColumn1, mockColumn2]);
            expect(result).toHaveLength(2);
        });

        it('should extract columns from multiple FLAT configs', () => {
            const dimension: ChartConfigDimension = {
                key: 'yAxis',
                mode: ChartConfigMode.CONFIG_DRIVEN,
                config: [
                    {
                        type: DimensionType.FLAT,
                        column: mockColumn1,
                    },
                    {
                        type: DimensionType.FLAT,
                        column: mockColumn2,
                    },
                ],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([mockColumn1, mockColumn2]);
            expect(result).toHaveLength(2);
        });

        it('should extract columns from mixed FLAT and MERGED configs', () => {
            const dimension: ChartConfigDimension = {
                key: 'yAxis',
                mode: ChartConfigMode.CONFIG_DRIVEN,
                config: [
                    {
                        type: DimensionType.FLAT,
                        column: mockColumn1,
                    },
                    {
                        type: DimensionType.MERGED,
                        columns: [mockColumn2, mockColumn3],
                    },
                ],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([mockColumn1, mockColumn2, mockColumn3]);
            expect(result).toHaveLength(3);
        });

        it('should extract columns from DUAL config', () => {
            const dimension: ChartConfigDimension = {
                key: 'yAxis',
                mode: ChartConfigMode.CONFIG_DRIVEN,
                config: [
                    {
                        type: DimensionType.DUAL,
                        primary: {
                            type: DimensionType.FLAT,
                            column: mockColumn1,
                        },
                        secondary: {
                            type: DimensionType.FLAT,
                            column: mockColumn2,
                        },
                    },
                ],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([mockColumn1, mockColumn2]);
            expect(result).toHaveLength(2);
        });

        it('should extract columns from complex nested config', () => {
            const dimension: ChartConfigDimension = {
                key: 'yAxis',
                mode: ChartConfigMode.CONFIG_DRIVEN,
                config: [
                    {
                        type: DimensionType.FLAT,
                        column: mockColumn1,
                    },
                    {
                        type: DimensionType.DUAL,
                        primary: {
                            type: DimensionType.MERGED,
                            columns: [mockColumn2, mockColumn3],
                        },
                        secondary: {
                            type: DimensionType.FLAT,
                            column: mockColumn4,
                        },
                    },
                ],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([
                mockColumn1,
                mockColumn2,
                mockColumn3,
                mockColumn4,
            ]);
            expect(result).toHaveLength(4);
        });

        it('should return empty array for CONFIG_DRIVEN dimension with no configs', () => {
            const dimension: ChartConfigDimension = {
                key: 'yAxis',
                mode: ChartConfigMode.CONFIG_DRIVEN,
                config: [],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should handle multiple MERGED configs correctly', () => {
            const dimension: ChartConfigDimension = {
                key: 'yAxis',
                mode: ChartConfigMode.CONFIG_DRIVEN,
                config: [
                    {
                        type: DimensionType.MERGED,
                        columns: [mockColumn1, mockColumn2],
                    },
                    {
                        type: DimensionType.MERGED,
                        columns: [mockColumn3, mockColumn4],
                    },
                ],
            };

            const result = fetchQueryColumns(dimension);

            expect(result).toEqual([
                mockColumn1,
                mockColumn2,
                mockColumn3,
                mockColumn4,
            ]);
            expect(result).toHaveLength(4);
        });
    });
});
