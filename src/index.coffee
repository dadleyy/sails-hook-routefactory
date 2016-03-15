module.exports = (sails) ->

  hook = {}
  generators = {}

  upper = (str) -> "#{str or ""}".toUpperCase()
  lower = (str) -> "#{str or ""}".toLowerCase()

  normalizePath = (parts...) -> (parts.join "/").replace /\/{2,}/g, "/"

  DEFAULT_SHORTHANDS = [
    "get", "post", "patch", "destroy:delete"
  ]

  registerShorthands = (mappings) ->
    for mapping in mappings
      [fn, method] = mapping.split ":"
      method ||= upper fn
      generators[lower fn] = shorthandGenerator method

  generators.resource = (scope) ->
    handler = () ->
    handler

  generators.group = (scope) ->
    handler = (level, gen) ->
      original = scope.level
      scope.level = normalizePath scope.level, level
      gen()
      scope.level = original

    handler

  generators.route = (scope) ->
    handler = (method_path, mapping) ->
      [method, path] = method_path.split " "
      level_path = normalizePath scope.level, path
      scope.routes["#{method} #{level_path}"] = mapping

    handler

  generators.resource = (scope) ->
    handler = (path, controller) ->
    handler

  shorthandGenerator = (method) ->
    generator = (scope) ->
      handler = (path, mapping) ->
        (generators.route scope)("#{upper method} #{path}", mapping)
      handler

    generator

  registerShorthands DEFAULT_SHORTHANDS

  factory = (generator) ->
    scope = {level: "", routes: {}}

    for name, fn of generators
      @[name] = fn(scope)

    generator this

    scope.routes

  hook.initialize = (cb) ->
    applyFactory = ->
      gen = sails.config.routefactory
      routes = factory gen

      cb false, routes

    sails.after ["hook:userconfig:loaded"], applyFactory

  hook
