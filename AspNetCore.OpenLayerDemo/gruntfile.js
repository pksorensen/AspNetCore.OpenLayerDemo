
function npmcopy(grunt) {
	var data = grunt.file.readJSON("npmcopy.json");
	var packages = grunt.file.readJSON("package.json");

	packages.dependencies = packages.dependencies || {};
	packages.devDependencies = packages.devDependencies || {};

	for (var key in data) {
		var copy = [];
		if (typeof data[key] === "string") {
			if (packages.dependencies[data[key].split('/')[0]] || packages.devDependencies[data[key].split('/')[0]]) {
				copy.push(data[key]);
			}
		} else {
			for (var i in data[key]) {
				if (packages.dependencies[data[key][i].split('/')[0]] || packages.devDependencies[data[key][i].split('/')[0]]) {
					copy.push(data[key][i]);
				}
			}
		}

		if (copy.length === 0) {
			delete data[key];
		} else {
			data[key] = copy;
		}
	}
	console.log(data);
	return data;
}

var outputPath = "artifacts/app";

module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-npmcopy');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	grunt.registerTask("initProject", ["npmcopy"]);
	grunt.registerTask("buildLib", ["copy", "lessDependencis"]);
	grunt.registerTask("packLib", ["initProject", "buildLib", "requirejs"]);



	grunt.registerTask("lessDependencis", "myLessDependencies", function (l, b) {
		var artifacOutDir = outputPath + "/src";
		var jsFiles = grunt.file.expand([artifacOutDir + "/**/*.js"], { cwd: artifacOutDir });
		var lessFiles = {};
		jsFiles.forEach(function (f) {


			var content = grunt.file.read(f);
			var path = f.substr(artifacOutDir.length);
			var src = "src" + path.substr(0, path.lastIndexOf("/") + 1);

			var m = content.match(/define\(\[.*\],/g);
			if (m) {

				var all = m[0].match(/"css\!.*?\.(less|css)"/g);
				if (all && all.length) {

					for (var j = 0; j < all.length; j++) {

						var relPath = all[j].substr("css!".length + 1, all[j].length - 2 - "css!".length);

						if (relPath[0] === "." && relPath[1] === "/")
							relPath = relPath.substr(2);

						console.log(src + relPath);

						if (relPath.substr(relPath.lastIndexOf(".", relPath.lastIndexOf("."))) === ".css") {

							relPath = relPath.substr(0, relPath.lastIndexOf(".", relPath.lastIndexOf(".") - 1)) + ".less";

							if (grunt.file.exists(src + relPath)) {

								lessFiles[f.substr(0, f.lastIndexOf("/") + 1) + relPath.substr(0, relPath.lastIndexOf(".")) + ".min.css"] = src + relPath;
							}
						} else {

							lessFiles[f.substr(0, f.lastIndexOf("/") + 1) + relPath.substr(0, relPath.lastIndexOf(".")) + ".min.css"] = src + relPath;
						}
					}
					var replaced = content;
					var i = 10;
					do {
						old = replaced;
						replaced = old.replace(/(define\(\[.*"css\!.*)(\.less)(".*\],[\s\S]*)/g, function (a, p1, p2, p3) {
							console.log(i);
							console.log("p1 " + p1);
							console.log("p2 " + p2);
							return p1 + ".min.css" + p3;
						})

					} while (i-- > 0 && old !== replaced);

					//content.replace(/(define\(\[.*"css\!.*)(\.less)(".*\],[\s\S]*)/g, "$1.min.css$3")
					grunt.file.write(f, replaced);
				}

			}
		});

		console.log(lessFiles);
		var lessTaskName = "less.srclib";
		grunt.config.set(lessTaskName, {
			options: {
				compress: true,
				paths: [outputPath + "/src"],
				modifyVars: {
					//   variable: '#fff',
					"md-focused-color": "#2e80ab"
				},
				plugins: [
                    new (require('less-plugin-autoprefix'))({ browsers: ["last 2 versions"] }),
                    new (require('less-plugin-clean-css'))({ advanced: true })
				],
			},
			files: lessFiles
		});
		var tasks = [lessTaskName].filter(function (f) { return f }).map(function (t) { return t.replace(".", ":"); });
		grunt.task.run(tasks);

	});


	grunt.initConfig({
		requirejs: {
			compileApp: {
				options: {
					// appDir:'./',
					baseUrl: outputPath,
					mainConfigFile: 'require-config.js',
					paths: {
						"oidc-client": "empty:",
						"knockout": "libs/knockout/knockout-latest", //"empty:"
					},
					dir: "wwwroot",
					modules: [
                        {
                        	name: "WebPIPortal/index",
                        	include: [],
                        	exclude: ["nprogress"]
                        },

					],
					removeCombined: true,
					optimize: "uglify",//"none",// "uglify",
					generateSourceMaps: false,
					optimizeCss: "none",// "standard.keepLines.keepWhitespace",
					onModuleBundleComplete: function (data) {
						console.log(data);
						var existing = grunt.file.exists("wwwroot/modules.json") ? grunt.file.readJSON("wwwroot/modules.json") : [];
						console.log(existing);
						var found = false;
						for (var i = 0; i < existing.length; i++) {
							if (existing[i].name === data.name) {
								existing[i] = data;
								found = true;
								break;
							}
						}
						if (!found) {
							existing.push(data);
						}

						grunt.file.write("wwwroot/modules.json", JSON.stringify(existing, null, 4));
					},
					//done: function (done, output) {

					//    var duplicates = require('rjs-build-analysis').duplicates(output);

					//    if (Object.keys(duplicates).length) {
					//        grunt.log.subhead('Duplicates found in requirejs build:');
					//        grunt.log.warn(duplicates);
					//        return done(new Error('r.js built duplicate modules, please check the excludes option.'));
					//    }

					//    done();
					//}
				}
			}
		},
		copy: {
			root: {
				files: [

                    {
                    	expand: true, cwd: "src", src: ["*.html", "*.appcache", "modules.json"],
                    	dest: outputPath
                    }
				]
			},
			bin: {
				files: [

                    {
                    	expand: true, cwd: "src", src: ["**/content/**/*.png", "**/content/**/*.jpg", '**/fonts/**/*.eot', '**/fonts/**/*.svg', '**/fonts/**/*.ttf', '**/fonts/**/*.woff', '**/fonts/**/*.woff2'],
                    	dest: outputPath + "/src"
                    },
				]//
			},
			lib: {
				files: [
                    { expand: true, cwd: "src", src: ["**/*.less", "**/*.json", "**/templates/**/*.html", "**/*.js"], dest: outputPath + "/src" }
				]//
                ,
				options: {
					process: function (content, srcpath) {

						if (srcpath.split(".").pop() === 'json') {
							return require("strip-json-comments")(content);
						}

						return content;
					},
				},
			}
		}
        ,
		npmcopy: {
			libs: {
				options: {
					destPrefix: outputPath + '/libs'
				},
				files: npmcopy(grunt)
			}
		}
	});
};