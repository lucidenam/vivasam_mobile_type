export const BlockDebug = (function (): (debugOn: boolean, suppressAll?: boolean) => void {
    const savedConsole: Console = console;
    /**
     * 디버그 콘솔 출력을 제어하는 함수
     * @param debugOn - false일 경우 console.log를 비활성화
     * @param suppressAll - true일 경우 모든 console 메서드(info, warn, error)를 비활성화
     */
    return function (debugOn: boolean, suppressAll?: boolean): void {
        const suppress: boolean = suppressAll || false;
        if (debugOn === false) {
            // suppress the default console functionality
            (window as any).console = {} as Console;
            (window as any).console.log = function (): void {};
            // suppress all type of consoles
            if (suppress) {
                (window as any).console.info = function (): void {};
                (window as any).console.warn = function (): void {};
                (window as any).console.error = function (): void {};
            } else {
                (window as any).console.info = savedConsole.info;
                (window as any).console.warn = savedConsole.warn;
                (window as any).console.error = savedConsole.error;
            }
        } else {
            (window as any).console = savedConsole;
        }
    };
})();