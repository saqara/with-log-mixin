/**
 * @summary Log mixin for ValidatedQuery
 * @locus Server
 * @export
 * @mixin WithLogMixin
 * @param {Object} options
 * @param {Object} options.withLog
 * @param {Function} [options.withLog.logError]
 * @param {Function} options.withLog.logQuery
 * @param {Function} [options.withLog.logSucces]
 * @throws {TypeError}
 * @return {Object}
 */
export default function WithLogMixin (methodOptions) {
  if (!methodOptions.withLog || typeof methodOptions.withLog !== 'object') {
    throw new TypeError(
      'WithLogMixin: You must specify `withLog` option in ValidatedQuery options.'
    )
  }

  if (!methodOptions.withLog.logQuery || typeof methodOptions.withLog.logQuery !== 'function') {
    throw new TypeError('WithLogMixin: `logQuery` must be a function.')
  }

  const options = { ...methodOptions }

  const {
    includeExecutionTime,
    logError,
    logQuery,
    logSuccess
  } = options.withLog
  const originalRun = options.run

  options.run = async function withLogMixin (obj, args, context, info) {
    const startTime = includeExecutionTime ? (new Date()).valueOf() : undefined
    let result

    logQuery({
      args,
      context,
      info,
      name: options.name,
      obj,
      startTime
    })

    try {
      result = await originalRun.call(this, obj, args, context, info)
    } catch (error) {
      if (logError) {
        logError({
          error,
          name: options.name
        })
      }
      throw error
    }

    const endTime = (new Date()).valueOf()
    if (logSuccess) {
      logSuccess({
        endTime,
        executionTime: endTime - startTime,
        name: options.name,
        result,
        startTime
      })
    }
    return result
  }
  return options
}
