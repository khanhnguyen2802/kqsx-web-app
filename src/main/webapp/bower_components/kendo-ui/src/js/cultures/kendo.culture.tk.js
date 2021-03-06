/** 
 * Copyright 2017 Telerik AD                                                                                                                                                                            
 *                                                                                                                                                                                                      
 * Licensed under the Apache License, Version 2.0 (the "License");                                                                                                                                      
 * you may not use this file except in compliance with the License.                                                                                                                                     
 * You may obtain a copy of the License at                                                                                                                                                              
 *                                                                                                                                                                                                      
 *     http://www.apache.org/licenses/LICENSE-2.0                                                                                                                                                       
 *                                                                                                                                                                                                      
 * Unless required by applicable law or agreed to in writing, software                                                                                                                                  
 * distributed under the License is distributed on an "AS IS" BASIS,                                                                                                                                    
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.                                                                                                                             
 * See the License for the specific language governing permissions and                                                                                                                                  
 * limitations under the License.                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/

(function(f){
    if (typeof define === 'function' && define.amd) {
        define(["kendo.core"], f);
    } else {
        f();
    }
}(function(){
(function( window, undefined ) {
    kendo.cultures["tk"] = {
        name: "tk",
        numberFormat: {
            pattern: ["-n"],
            decimals: 2,
            ",": "??",
            ".": ",",
            groupSize: [3],
            percent: {
                pattern: ["-n %","n %"],
                decimals: 2,
                ",": "??",
                ".": ",",
                groupSize: [3],
                symbol: "%"
            },
            currency: {
                name: "",
                abbr: "",
                pattern: ["-n$","n$"],
                decimals: 2,
                ",": "??",
                ".": ",",
                groupSize: [3],
                symbol: "m."
            }
        },
        calendars: {
            standard: {
                days: {
                    names: ["??ek??enbe","Du??enbe","Si??enbe","??ar??enbe","Pen??enbe","Anna","??enbe"],
                    namesAbbr: ["??b","Db","Sb","??b","Pb","An","??b"],
                    namesShort: ["??","D","S","??","P","A","??"]
                },
                months: {
                    names: ["??anwar","Fewral","Mart","Aprel","Ma??","l??un","l??ul","Awgust","Sent??abr","Okt??abr","No??abr","Dekabr"],
                    namesAbbr: ["??an","Few","Mart","Apr","Ma??","l??un","l??ul","Awg","Sen","Okt","No??","Dek"]
                },
                AM: [""],
                PM: [""],
                patterns: {
                    d: "dd.MM.yy '??.'",
                    D: "yyyy'-nji ??yly?? 'd'-nji 'MMMM",
                    F: "yyyy'-nji ??yly?? 'd'-nji 'MMMM HH:mm:ss",
                    g: "dd.MM.yy '??.' HH:mm",
                    G: "dd.MM.yy '??.' HH:mm:ss",
                    m: "d MMMM",
                    M: "d MMMM",
                    s: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
                    t: "HH:mm",
                    T: "HH:mm:ss",
                    u: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
                    y: "yyyy '??.' MMMM",
                    Y: "yyyy '??.' MMMM"
                },
                "/": ".",
                ":": ":",
                firstDay: 1
            }
        }
    }
})(this);
}));