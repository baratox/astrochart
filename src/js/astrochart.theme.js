import * as Snap from 'snapsvg'
import './snap/snap.orbit'
import './snap/snap.transformOriginal'
import $ from 'jquery'
import template from '../image/zodiac.svg'
/**
 * A theme draws the actual map with all provided information.
 * The theme is composed of two SVG templates
 **/
export default function AstrochartTheme (element, _settings) {
  var settings = $.extend({
    // SVG template to load
    'template': '/dist/image/zodiac.svg',

    animationDuration: 1400, // ms

    // Center of all that exists, around which everything orbits.
    'center': { 'x': 300, 'y': 300 },
    // Radius of the circular orbit for all orbs.
    'orbit-radius': 207,
    'orbit-radius-synastry': 158,

    // Radius of the ends of an aspect line.
    'aspect-radius': 174,
    'aspect-radius-synastry': 132,

    // The `strokeWidth` of the line for an aspect between two orbs increases with how strong
    // the aspect is. This setting is the `strokeWidth` when the aspect is the strongest.
    'aspect-full-stroke': 4,

    // The name of all supported orbs: planets, ex-planets, asteroids, etc.
    // This is also the id for the SVG sprite for it in the template.
    'orbs': {
      sun: { startPosition: 36 * 1 },
      moon: { startPosition: 36 * 2 },
      mercury: { startPosition: 36 * 3 },
      venus: { startPosition: 36 * 4 },
      mars: { startPosition: 36 * 5 },
      jupiter: { startPosition: 36 * 6 },
      saturn: { startPosition: 36 * 7 },
      uranus: { startPosition: 36 * 8 },
      neptune: { startPosition: 36 * 9 },
      pluto: { startPosition: 36 * 10 }
    },

    // Id of the SVG element to use as orb sprite when a specific one is not found.
    'orb-sprite-default': 'planet',
    // Size in pixels of a single orb sprite in the template.
    'orb-sprite-size': 108,

    'houses': {
      'visible': true,
      'house-1': {
        // The angular position for this house in the template.
        // Starts at the further west and moves counterclockwise.
        'position': 0,
        // The angular position for the center of this house's text in the template.
        'text-position': 270
      },
      'house-2': { 'position': 30, 'text-position': 270 },
      'house-3': { 'position': 60, 'text-position': 270 },
      'house-4': { 'position': 90, 'text-position': 270 },
      'house-5': { 'position': 120, 'text-position': 270 },
      'house-6': { 'position': 150, 'text-position': 270 },
      'house-7': { 'position': 180, 'text-position': 270 },
      'house-8': { 'position': 210, 'text-position': 270 },
      'house-9': { 'position': 240, 'text-position': 270 },
      'house-10': { 'position': 270, 'text-position': 270 },
      'house-11': { 'position': 300, 'text-position': 270 },
      'house-12': { 'position': 330, 'text-position': 270 }
    },
    // The rotation of the zodiac wheel in the template, considering 0 as the
    // middlepoint between *Pisces* and *Aries*.
    'zodiac-rotation': 0,

    // Size of the chart from the template
    'width': 600,
    'height': 600,

    'synastry': false
  }, _settings)

  // console.log('Appending Astrochart to ' + element)
  var _svg = Snap(element)
  _svg.attr({
    viewBox: '0 0 ' + [settings['width'], settings['height']].join(' ')
  })

  load(Snap.parse(template))

  function load (svg) {
    // Add everything from the sprites file.
    _svg.append(svg.select('#zodiac'))
    _svg.select('#zodiac').data('rotation', settings['zodiac-rotation'])

    loadHousesFromTemplate(svg, '#main')
    _svg.append(svg.select('#zodiac-inner-track'))
    loadHousesFromTemplate(svg, '#synastry')
    _svg.append(svg.select('#top'))

    _svg.select('#zodiac').transformOriginal()

    loadOrbsFromTemplate(svg, '#main', settings['orbit-radius'])
    loadOrbsFromTemplate(svg, '#synastry', settings['orbit-radius-synastry'])

    _svg.select('#synastry').attr({ visibility: 'hidden' })

    // console.debug('Finished loading template.')
  }

  function loadHousesFromTemplate (svg, root) {
    _svg.append(svg.select(root))

    // Initial position for houses in the sprites file.
    for (var house = 1; house <= 12; house++) {
      var id = 'house-' + house
      var text = _svg.select(root + ' .label.' + id)
      if (text) {
        text.data('position', settings['houses'][id]['text-position'])
      }

      var marker = _svg.select(root + ' .start-divider.' + id)
      if (marker) {
        marker.data('position', settings['houses'][id]['position'])
        marker.data('text', text)
      }
    }

    _svg.select(root).attr({
      'visibility': settings['houses']['visible'] ? 'visible' : 'hidden'
    })
  }

  function loadOrbsFromTemplate (svg, root, orbit) {
    for (var orb in settings.orbs) {
      loadSpaceObject(svg, orb)
    }

    function loadSpaceObject (svg, name) {
      var object = svg.select('#' + name)
      if (!object) {
        // Create one based on the default planet sprite
        object = svg.select('#' + settings['orb-sprite-default'])
      }

      const position = settings.orbs[name].startPosition

      object = object.clone()
      object.attr({ 'id': '', 'class': name + ' orb' })
      object.data('position', position)
      _svg.select(root).append(object)

      // Scale the planet down and center it to its coordinates
      var scale = 0.420
      var half = scale * settings['orb-sprite-size'] / 2

      var matrix = new Snap.Matrix()
      matrix.translate(-half, -half)
      matrix.scale(scale)
      object.transform(matrix)
      object.transformOriginal()

      object.data('orbit', orbit)
      object.orbit(position, orbit, settings['center'].x, settings['center'].y)
    };
  }

  /**
     * Rounds angles to 5 decimal places to avoid complex values
     * when calculating.
     */
  var _round = function (number) {
    if (typeof (number) !== 'number') console.warn('Invalid number', number, typeof (number))
    var rounded = number
    if (number < 0) {
      rounded += 360
    }
    if (number >= 360) {
      rounded -= 360
    }

    return Number(rounded.toFixed(3))
  }

  var _centerHouseText = function (houseNumber, synastry) {
    var text = house(houseNumber, undefined, synastry).data('text')
    if (text) {
      var next = houseNumber < 12 ? houseNumber + 1 : 1

      const begin = house(houseNumber, undefined, synastry).data('position')
      const end = house(next, undefined, synastry).data('position')

      var center = _round((begin + end) / 2)
      if (begin > end) center += 180

      var rotation = _round(text.data('position') - center)
      // console.log("Centering text for house", houseNumber, synastry ? " (synastry)" : "", "to", center, "by", rotation, "was", text.data("position"));
      text.data('position', center)

      var matrix = new Snap.Matrix()
      matrix.rotate(rotation, 300, 300)
      matrix.add(text.transform().localMatrix)
      text.transformOriginal(matrix)

      return text
    } else {
      throw new Error('No text for house ' + houseNumber)
    }
  }

  var invalidate = function () {
    for (var house = 1; house <= 12; house++) {
      _centerHouseText(house)
      _centerHouseText(house, true)
    }
  }

  /**
     * Rotates the wheel so that given angle 'zodiac' is at 180º.
     * - zodiac: Zodiac-originated angle, with 0º at the
     *           start of Aries.
     */
  var ascendant = function (zodiac) {
    var wheel = _svg.select('#zodiac')
    if (wheel) {
      if (zodiac === undefined) {
        return wheel
      }

      zodiac = _round(zodiac)

      var angleFrom = wheel.data('rotation')
      var angleTo = zodiac
      // console.debug('Rotating zodiac to', zodiac, angleFrom, angleTo)
      // eslint-disable-next-line no-undef
      let easeout = mina.easeout
      Snap.animate(angleFrom, angleTo, function (value) {
        var matrix = new Snap.Matrix()
        matrix.rotate(-value, 300, 300)
        wheel.transformOriginal(matrix)
      }, settings.animationDuration, easeout)

      wheel.data('rotation', angleTo)

      return wheel
    } else {
      throw new Error('Zodiac does not exist')
    }
  }

  var house = function (house, zodiac, synastry = false) {
    const root = synastry ? '#synastry' : '#main'
    var element = _svg.select(`${root} .houses .house-${house}.start-divider`)

    // console.debug('Rotating house', house)

    if (element) {
      if (zodiac === undefined) {
        return element
      }

      var absolute = _round(zodiac)
      var rotation = _round(element.data('position') - absolute)

      // console.debug('Rotating house', house, 'to', absolute, '(', rotation, 'rotation ).')

      var matrix = new Snap.Matrix()
      matrix.rotate(rotation, 300, 300)
      matrix.add(element.transform().localMatrix)
      element.transformOriginal(matrix)

      element.data('position', absolute)

      // Remove any aspect with this house
      var aspects = _svg.selectAll(`.aspect.house-${name}`)
      aspects.forEach(aspect => aspect.remove())

      return element
    } else {
      throw new Error('House ' + house + ' does not exist')
    }
  }

  var orb = function (name, zodiac, synastry = false) {
    const root = synastry ? '#synastry' : '#main'
    var element = _svg.select(`${root} .orb.${name}`)
    if (element) {
      if (zodiac === undefined) {
        return element
      }

      var angleFrom = element.data('position')
      // Rotate counter-clock, with 0º at the farthest west, the ascendant.
      var angleTo = _round(-zodiac)

      // console.debug('Moving', name, 'from', angleFrom, 'to', angleTo)

      // Run animation if already loaded
      // eslint-disable-next-line no-undef
      let easeout = mina.easeout
      Snap.animate(angleFrom, angleTo, function (value) {
        element.orbit(value + 180, element.data('orbit'),
          settings['center'].x, settings['center'].y)
      }, settings.animationDuration, easeout)

      element.data('position', angleTo)

      // Remove any aspect with this orb
      var aspects = _svg.selectAll(`.aspect.${name}`)
      aspects.forEach(aspect => aspect.remove())

      return element
    } else {
      throw new Error('Orb ' + name + ' does not exist')
    }
  }

  function _isAspectTarget (target) {
    if (settings.orbs[target]) {
      return true
    } else if (target in settings['houses']) {
      return true
    }

    return false
  };

  // Shows the relationship between two objects in the chart
  var aspect = function (a, b, value, classes) {
    if (!_isAspectTarget(a)) throw new Error(a + ' is unknown')
    if (!_isAspectTarget(b)) throw new Error(b + ' is unknown')

    let orbA = _svg.select('#main .orb.' + a)
    let orbB
    if (settings['synastry']) {
      orbB = _svg.select('#synastry .orb.' + b)
    } else {
      orbB = _svg.select('#main .orb.' + b)
    }

    const orbit = settings['synastry'] ? settings['aspect-radius-synastry'] : settings['aspect-radius']

    var orbAVertex = _svg.get_orbit(orbA.data('position') + 180, orbit,
      settings['center'].x, settings['center'].y)
    var orbBVertex = _svg.get_orbit(orbB.data('position') + 180, orbit,
      settings['center'].x, settings['center'].y)

    var line = _svg.select(`.aspect.${a}.${b}`)
    if (!line) {
      line = _svg.line(orbAVertex.x, orbAVertex.y, orbBVertex.x, orbBVertex.y)
      line.attr({ 'class': `aspect ${a} ${b} ${classes}` })
      line.attr({
        stroke: '#777',
        strokeWidth: value * settings['aspect-full-stroke'],
        opacity: 0
      })
      _svg.add(line)
    } else {
      line.attr({
        'class': classes,
        'x1': orbAVertex.x,
        'y1': orbAVertex.y,
        'x2': orbBVertex.x,
        'y2': orbBVertex.y,
        'strokeWidth': value * settings['aspect-full-stroke'],
        'opacity': 0
      })
    }

    // eslint-disable-next-line no-undef
    let easeout = mina.easeout
    Snap.animate(0, 1, function (opacity) {
      line.attr({ opacity })
    }, settings.animationDuration, easeout)

    return line
  }

  var synastry = function (enabled) {
    settings['synastry'] = enabled
    _svg.select('#synastry').attr({ visibility: enabled ? 'visible' : 'hidden' })
    _svg.select('#cover').attr({ visibility: enabled ? 'hidden' : 'visible' })
  }

  // Builds the public API for an AstrochartTheme.
  return {
    'ascendant': ascendant,
    'orb': orb,
    'house': house,
    'aspect': aspect,
    'invalidate': invalidate,
    synastry
  }
};
