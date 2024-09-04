/**
 * @group Chart to ThoughtSpot Events / Context Menu
 */
// start - open context menu payload
export interface PointVal {
    // Column ID of the column associated with the value
    columnId: string;
    // Value of the point clicked on, mostly makes sense for attributes.
    // This can be an array of values as well.
    value: any;
}
/**
 *
 * @group Chart to ThoughtSpot Events / Context Menu
 */
export interface Point {
    tuple: PointVal[];
}
