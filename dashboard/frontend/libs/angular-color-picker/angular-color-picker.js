(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'module', 'angular' ], function (module, angular) {
            module.exports = factory(angular);
        });
    } else if (typeof module === 'object') {
        module.exports = factory(require('angular'));
    } else {
        if (!root.mp) {
            root.mp = {};
        }

        root.mp.colorPicker = factory(root.angular);
    }
}(this, function (angular) {
    'use strict';

    function hsvToHexRgb(h, s, v) {
        if (typeof h === 'object') {
            s = h.s;
            v = h.v;
            h = h.h;
        }

        var i = Math.floor(h * 6),
            f = h * 6 - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s);

        var r, g, b;

        switch (i % 6) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
        }

        r = Math.floor(r * 255) + 256;
        g = Math.floor(g * 255) + 256;
        b = Math.floor(b * 255) + 256;

        return '#'
            + r.toString(16).slice(1)
            + g.toString(16).slice(1)
            + b.toString(16).slice(1);
    }

    /**
     * Heavily based on:
     * http://stackoverflow.com/a/8023734/23501
     */
    function hexRgbToHsv(hexRgb) {
        var tokens = /^#(..)(..)(..)$/.exec(hexRgb);

        if (tokens) {
            var rgb = tokens.slice(1).map(function (hex) {
                return parseInt(hex, 16) / 255; // Normalize to 1
            });

            var r = rgb[0],
                g = rgb[1],
                b = rgb[2],
                h, s,
                v = Math.max(r, g, b),
                diff = v - Math.min(r, g, b),
                diffc = function (c) {
                    return (v - c) / 6 / diff + 1 / 2;
                };

            if (diff === 0) {
                h = s = 0;
            } else {
                s = diff / v;

                var rr = diffc(r),
                    gg = diffc(g),
                    bb = diffc(b);

                if (r === v) {
                    h = bb - gg;
                } else if (g === v) {
                    h = (1 / 3) + rr - bb;
                } else if (b === v) {
                    h = (2 / 3) + gg - rr;
                }

                if (h < 0) {
                    h += 1;
                } else if (h > 1) {
                    h -= 1;
                }
            }

            return {
                h: h,
                s: s,
                v: v
            };
        }
    }

    return angular.module('mp.colorPicker', []).directive('colorPicker', [ '$window', 'localStorageService', function ($window, localStorageService) {
        // Introduce custom elements for IE8
        $window.document.createElement('color-picker');

        var tmpl = ''
            + '<div class="angular-color-picker">'
            + '    <div class="_variations" ng-style="{ backgroundColor: hueBackgroundColor }">'
            + '        <div class="_whites">'
            + '            <div class="_blacks">'
            + '                <div class="_cursor" ng-if="colorCursor" ng-style="{ left: colorCursor.x - 5 + \'px\', top: colorCursor.y - 5 + \'px\' }"></div>'
            + '                <div class="_mouse-trap" ng-mousedown="startDrag($event, \'color\')"></div>'
            + '            </div>'
            + '        </div>'
            + '    </div>'
            + ''
            + '    <div class="_hues">'
            + '        <div class="_ie-1"></div>'
            + '        <div class="_ie-2"></div>'
            + '        <div class="_ie-3"></div>'
            + '        <div class="_ie-4"></div>'
            + '        <div class="_ie-5"></div>'
            + '        <div class="_ie-6"></div>'
            + '        <div class="_cursor" ng-style="{ top: hueCursor - 5 + \'px\' }"></div>'
            + '        <div class="_mouse-trap" ng-mousedown="startDrag($event, \'hue\')"></div>'
            + '    </div>'
            + '    <div class="_standard">'
            + '       <div class="_label">Standard Colors</div>'
            + '       <div class="_citem" ng-style="colorStyle(citem)" ng-class="isActive(citem)" ng-click="selectStandard(citem)" ng-repeat="citem in standard track by $index"></div>'
            + '    </div>'
            + '    <div class="_recent">'
            + '       <div class="_label">Recent Colors</div>'
            + '       <div class="_citem" ng-style="colorStyle(citem)" ng-class="isActive(citem)" ng-click="selectRecent(citem)" ng-repeat="citem in recent track by $index" ></div>'
            + '    </div>'
            + '    <div class="_button">'
            + '       <div class="md-button" ng-click="selectCurrent()" >SELECT</div>'
            + '       <div class="md-button" ng-click="cancel()" >CLOSE</div>'
            + '    </div>'
            + '</div>';

        return {
            restrict: 'AE',
            template: tmpl,
            replace: true,
            require: '?ngModel',
            scope: {
                onSelectColor: "="
            },

            link: function ($scope, $element, $attributes, ngModel) {
                $scope.recent = localStorageService.get('recentColors');
                $scope.hsv = { h: 0, s: 0, v: 0 };
                $scope.standard = ['#ff0000', '#ff00ff', '#0000ff', '#00ffff', '#ffff00', '#d0d0d0', '#808080'];
                if(!$scope.recent) $scope.recent = [];
                if($scope.recent.length > $scope.standard.length)
                    $scope.recent.splice($scope.standard.length);
                $scope.colorStyle = function(color) {
                    if(color) {
                        return {'background-color' : color};
                    }
                    else {
                        return {'background-color' : null};
                    }
                };

                $scope.selectStandard = function(color) {
                    setColorValue(color);

                  if($scope.onSelectColor) {
                    $scope.onSelectColor(color);
                  }
                };

                $scope.selectRecent = function(color) {
                    setColorValue(color);
                    if($scope.onSelectColor) {
                        $scope.onSelectColor(color);
                    }
                };

                $scope.selectCurrent = function(color) {
                    setColorValue(ngModel.$viewValue);

                    if($scope.onSelectColor) {
                      $scope.onSelectColor(ngModel.$viewValue);
                    }
                };

                $scope.cancel = function() {

                    if($scope.onSelectColor) {
                      $scope.onSelectColor(null);
                    }
                };

                $scope.isActive = function(color) {
                    return (color === $scope.color) ? 'active' : '';
                };



                if (ngModel) {
                    ngModel.$render = function () {
                        setColorValue(ngModel.$viewValue);
                    };
                }

                var dragSubject,
                    dragRect;

                function doDrag(x, y) {
                    x = Math.max(Math.min(x, dragRect.width), 0);
                    y = Math.max(Math.min(y, dragRect.height), 0);

                    if (dragSubject === 'hue') {
                        $scope.hueCursor = y;

                        $scope.hsv.h = y / dragRect.height;

                        $scope.hueBackgroundColor = hsvToHexRgb($scope.hsv.h, 1, 1);
                    } else {
                        $scope.colorCursor = {
                            x: x,
                            y: y
                        };

                        $scope.hsv.s = x / dragRect.width;
                        $scope.hsv.v = 1 - y / dragRect.height;
                    }

                    if (typeof $scope.hsv.s !== 'undefined') {
                        $scope.color = hsvToHexRgb($scope.hsv);

                        if (ngModel) {
                            ngModel.$setViewValue($scope.color);
                        }
                    }
                }

                function onMouseMove(evt) {
                    evt.preventDefault();

                    $scope.$apply(function () {
                        doDrag(evt.clientX - dragRect.x, evt.clientY - dragRect.y);
                    });
                }
                function onTouchMove(evt) {
                    evt.preventDefault();

                    $scope.$apply(function() {
                        doDrag(evt.targetTouches[0].clientX - dragRect.x, evt.targetTouches[0].clientY - dragRect.y);
                    });
                }
                function onMouseUp() {
                    angular.element($window)
                        .off('mousemove', onMouseMove)
                        .off('touchmove', onTouchMove);
                }

                $scope.startDrag = function (evt, subject) {
                    var rect = evt.target.getBoundingClientRect();

                    dragSubject = subject;
                    dragRect = {
                        x: rect.left,
                        y: rect.top,
                        width: rect.right - rect.left,
                        height: rect.bottom - rect.top
                    };

                    doDrag(evt.offsetX || evt.layerX, evt.offsetY || evt.layerY);

                    angular.element($window)
                        .on('mousemove', onMouseMove)
                        .on('touchmove', onTouchMove)
                        .one('mouseup', onMouseUp)
                        .one('touchend', onMouseUp);
                };

                function setColorValue(value) {
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        $scope.color = value;
                        $scope.hsv = hexRgbToHsv($scope.color);
                        $scope.colorCursor = {
                            x: $scope.hsv.s * 200,
                            y: (1 - $scope.hsv.v) * 200
                        };
                    } else {
                        $scope.color = null;
                        $scope.hsv = { h: 0.5 };
                        $scope.colorCursor = null;
                    }

                    $scope.hueBackgroundColor = hsvToHexRgb($scope.hsv.h, 1, 1);
                    $scope.hueCursor = $scope.hsv.h * 200;

                    //  update recent;
                    var index = $scope.recent.indexOf(value);
                    if(index != -1)
                      $scope.recent.splice(index, 1);
                    $scope.recent.unshift(value);
                    if($scope.recent.length > $scope.standard.length)
                      $scope.recent.splice($scope.standard.length-1, 1);

                    localStorageService.set('recentColor', $scope.recent);
                }
            }
        };
    }]);
}));
