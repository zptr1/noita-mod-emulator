---@diagnostic disable: undefined-global
-- This is ran right after init-ctx.lua if measurePerf is enabled

local _originalDofile = dofile;
local _originalDofileOnce = dofile_once;

function dofile(filename)
  local label = '"' .. filename .. '"*'
  __perf_begin(label)
  local result = _originalDofile(filename)
  __perf_end(label)

  return result
end

function dofile_once(filename)
  local label = '"' .. filename .. '"'
  __perf_begin(label)
  local result = _originalDofileOnce(filename)
  __perf_end(label)

  return result
end
