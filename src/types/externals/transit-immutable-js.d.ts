declare module 'transit-immutable-js' {
  /**
   * Transit serialization for Immutable.js
   * Converts JSON string to Immutable.js data structures
   */
  interface TransitImmutable {
    /**
     * Deserialize JSON string to Immutable.js objects
     * @param json - JSON string to deserialize
     * @returns Deserialized Immutable.js object (Map, List, etc.) or plain object
     */
    fromJSON(json: string): any;
    
    /**
     * Serialize Immutable.js objects to JSON string
     * @param obj - Immutable.js object or plain object to serialize
     * @returns JSON string
     */
    toJSON(obj: any): string;
  }

  const transit: TransitImmutable;
  export default transit;
}

