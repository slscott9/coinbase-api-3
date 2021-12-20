
export const logInfo = (message: string, context: string, data?: any) => {
    console.info({
        context, message, logLevel: 'INFO', data
    })
}

export const logAudit = (message: string, context: string, data?: any) => {
    console.info({
        context, message, logLevel: 'AUDIT', data
    })
}

export const logWarn = (message: string, context: string, data?: any) => {
    console.info({
        context, message, logLevel: 'WARN', data
    })
}

export const logError = (message: string, context: string, data?: any) => {
    console.info({
        context, message, logLevel: 'ERROR', data
    })
}

export const logDebug = (message: string, context: string, data?: any) => {
    console.info({
        context, message, logLevel: 'DEBUG', data
    })
}
