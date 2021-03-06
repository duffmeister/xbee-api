/*
 * xbee-api
 * https://github.com/jouz/xbee-api
 *
 * Copyright (c) 2013 Jan Kolkmeier
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');

var C = require('./constants.js');

var frame_builder = exports = module.exports = {};

// returns offset
function writeAny(buffer, offset, value, enc) {
  var _offset = 0;
  if (typeof value == "string") {
    _offset += buffer.write(value, offset+_offset, enc);
    //_offset += value.length;
  } else if (typeof value == "object") {
    for (var i=0; i < value.length || 0; i++) {
      buffer.writeUInt8(value[i], offset+_offset);
      _offset++;
    }
  }

  return _offset;
}

frame_builder[C.FRAME_TYPE.AT_COMMAND] = function(offset, frame) {
  var buffer = this.buildState.buffer;
  buffer.writeUInt8(frame.type, offset++); 
  buffer.writeUInt8(frame.id || this.nextFrameId(), offset++);
  offset += writeAny(buffer, offset, frame.command, 'ascii');
  offset += writeAny(buffer, offset, frame.commandParameter, 'ascii');
  return offset;
};

frame_builder[C.FRAME_TYPE.AT_COMMAND_QUEUE_PARAMETER_VALUE] = function(offset, frame) {
  var buffer = this.buildState.buffer;
  offset = frame_builder[C.FRAME_TYPE.AT_COMMAND].apply(this, [ offset, frame ]);
  buffer.writeUInt8(frame.type, 3); // nasty?
  return offset;
};


frame_builder[C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST] = function(offset, frame) {
  var buffer = this.buildState.buffer;
  buffer.writeUInt8(frame.type, offset++); 
  buffer.writeUInt8(frame.id || this.nextFrameId(), offset++);
  offset += writeAny(buffer, offset, frame.destination64 || C.UNKNOWN_64, 'hex');
  offset += writeAny(buffer, offset, frame.destination16 || C.UNKNOWN_16, 'hex');
  buffer.writeUInt8(frame.remoteCommandOptions || 0x02, offset++);
  offset += writeAny(buffer, offset, frame.command, 'ascii');
  offset += writeAny(buffer, offset, frame.commandParameter, 'ascii');
  return offset;
};

frame_builder[C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST] = function(offset, frame) {
  var buffer = this.buildState.buffer;
  buffer.writeUInt8(frame.type, offset++); 
  buffer.writeUInt8(frame.id || this.nextFrameId(), offset++);
  offset += writeAny(buffer, offset, frame.destination64 || C.UNKNOWN_64, 'hex');
  offset += writeAny(buffer, offset, frame.destination16 || C.UNKNOWN_16, 'hex');
  buffer.writeUInt8(frame.broadcastRadius || 0x00, offset++);
  buffer.writeUInt8(frame.options || 0x00, offset++);
  offset += writeAny(buffer, offset, frame.data, 'ascii');
  return offset;
};


frame_builder[C.FRAME_TYPE.EXPLICIT_ADDRESSING_ZIGBEE_COMMAND_FRAME] = function(offset, frame) {
  var buffer = this.buildState.buffer;
  buffer.writeUInt8(frame.type, offset++); 
  buffer.writeUInt8(frame.id || this.nextFrameId(), offset++);
  offset += writeAny(buffer, offset, frame.destination64 || C.UNKNOWN_64, 'hex');
  offset += writeAny(buffer, offset, frame.destination16 || C.UNKNOWN_16, 'hex');
  buffer.writeUInt8(frame.sourceEndpoint, offset++);
  buffer.writeUInt8(frame.destinationEndpoint, offset++);
  offset += writeAny(buffer, offset, frame.clusterId, 'hex');
  offset += writeAny(buffer, offset, frame.profileId, 'hex');
  buffer.writeUInt8(frame.broadcastRadius || 0x00, offset++);
  buffer.writeUInt8(frame.options || 0x00, offset++);
  offset += writeAny(buffer, offset, frame.data, 'ascii');
  return offset;
};

frame_builder[C.FRAME_TYPE.TX_REQUEST_64] = function(offset, frame) {
  var buffer = this.buildState.buffer;
  buffer.writeUInt8(frame.type, offset++); 
  buffer.writeUInt8(frame.id || this.nextFrameId(), offset++);
  offset += writeAny(buffer, offset, frame.destination64 || C.UNKNOWN_64, 'hex');
  buffer.writeUInt8(frame.options || 0x00, offset++);
  offset += writeAny(buffer, offset, frame.data, 'ascii');
  return offset;
}

frame_builder[C.FRAME_TYPE.TX_REQUEST_16] = function(offset, frame) {
  var buffer = this.buildState.buffer;
  buffer.writeUInt8(frame.type, offset++); 
  buffer.writeUInt8(frame.id || this.nextFrameId(), offset++);
  offset += writeAny(buffer, offset, frame.destination16 || C.BROADCAST_16_XB, 'hex');
  buffer.writeUInt8(frame.options || 0x00, offset++);
  offset += writeAny(buffer, offset, frame.data, 'ascii');
  return offset;
}
