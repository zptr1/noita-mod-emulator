---@diagnostic disable: deprecated, undefined-global
-- This is ran at the start of each lua context

__loaded = {}
__loadonce = {}

function loadfile(path)
  local file, display_path = __normalize_path(path)
  local content = ModTextFileGetContent(file)

  if not content then
		print_error("Error @ loadfile(" .. display_path .. "): Unknown file")
    return nil, "Unknown file"
  end

  local func, err = loadstring(content, "@" .. display_path)

  if not func then
		print_error("Error @ loadfile(" .. display_path .. "): " .. tostring(err))
    return nil, tostring(err)
  end

  return func
end

function dofile(filename)
  filename = __normalize_path(filename)

	local impl = __loaded[filename]
	if impl == nil then
		impl, error_message = loadfile(filename)
		if impl == nil then
			return impl, error_message
		end
		__loaded[filename] = impl
	end

	local result = impl()
	do_mod_appends(filename)
	return result
end

function dofile_once(filename)
  filename = __normalize_path(filename)

	local cached = __loadonce[filename]
	if cached ~= nil then
		return cached[1]
	else
		local impl, error_message = loadfile(filename)
		if impl == nil then
			return impl, error_message
		end
		local result = impl()
		__loadonce[filename] = { result }
		do_mod_appends(filename)
    return result
	end
end
