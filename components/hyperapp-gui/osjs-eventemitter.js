/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

/*
 * Gets an array of event names based in input,
 * be it array or a comma separated string.
 */
const getEventNames = name => (name instanceof Array)
  ? name
  : String(name).replace(/\s+/g, '').split(',');

/**
 * Event Emitter
 *
 * @desc A standards compatible event handler (observer) with some sugar.
 */
export class EventEmitter {

  /**
   * Create Event Handler
   * @param {string} [name] A name for logging
   */
  constructor(name = 'undefined') {
    /**
     * The name of the handler
     * @type {string}
     */
    this.name = name;

    /**
     * Registered events
     * @type {object}
     */
    this.events = {};
  }

  /**
   * Destroys all events
   */
  destroy() {
    this.events = {};
  }

  /**
   * Add an event handler
   *
   * You can supply an array of event names or a comma separated list with a string
   *
   * @param {string|string[]} name Event name
   * @param {Function} callback Callback function
   * @param {object} [options] Options
   * @param {boolean} [options.persist] This even handler cannot be removed unless forced
   * @param {boolean} [options.once] Fire only once
   * @return {EventEmitter} Returns current instance
   */
  on(name, callback, options = {}) {
    options = options || {};

    if (typeof callback !== 'function') {
      throw new TypeError('Invalid callback');
    }

    getEventNames(name).forEach(n => {
      if (!this.events[n]) {
        this.events[n] = [];
      }

      this.events[n].push({callback, options});
    });

    return this;
  }

  /**
   * Adds an event handler that only fires once
   * @return {EventEmitter} Returns current instance
   */
  once(name, callback) {
    return this.on(name, callback, {once: true});
  }

  /**
   * Removes an event handler
   *
   * If no callback is provided, all events bound to given name will be removed.
   *
   * You can supply an array of event names or a comma separated list with a string
   *
   * @param {string|string[]} name Event name
   * @param {Function} [callback] Callback function
   * @param {boolean} [force=false] Forces removal even if set to persis
   * @return {EventEmitter} Returns current instance
   */
  off(name, callback = null, force = false) {
    getEventNames(name)
      .filter(n => !!this.events[n])
      .forEach(n => {
        if (callback) {
          let i = this.events[n].length;
          while (i--) {
            const ev = this.events[n][i];
            const removable = !ev.options.persist || force;
            if (removable && ev.callback === callback) {
              this.events[n].splice(i, 1);
            }
          }
        } else {
          this.events[n] = force
            ? []
            : this.events[n].filter(({options}) => options.persist === true);
        }
      });

    return this;
  }

  /**
   * Emits an event
   *
   * You can supply an array of event names or a comma separated list with a string
   *
   * @param {string|string[]} name Event name
   * @param {*} [args] Arguments
   * @return {EventEmitter} Returns current instance
   */
  emit(name, ...args) {
    getEventNames(name).forEach(n => {
      if (this.events[n]) {
        let i = this.events[n].length;
        while (i--) {
          const {options, callback} = this.events[n][i];

          try {
            callback(...args);
          } catch (e) {
            console.warn(e);
          }

          if (options && options.once) {
            this.events[n].splice(i, 1);
          }
        }
      }
    });

    return this;
  }

}
