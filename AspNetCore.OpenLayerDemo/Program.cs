using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace AspNetCore.OpenLayerDemo
{
    public class RequireJS
    {
        public static async Task<TResult> RunAsync<TData, TResult>(string module, TData data)
        {

            var services = new ServiceCollection();
            services.AddNodeServices(a =>
            {
                // a.ProjectPath = Directory.GetCurrentDirectory(); 
                // Set any properties that you want on 'options' here
            });

            var serviceProvider = services.BuildServiceProvider();
            var options = new NodeServicesOptions(serviceProvider)
            {
                ProjectPath = Directory.GetCurrentDirectory() + "/tmphost",
                InvocationTimeoutMilliseconds = 60000 * 5,
            };
            var nodeServices = NodeServicesFactory.CreateNodeServices(options);



            var sb = new StringBuilder();

            // sb.AppendLine("return function (data,callback){");
            sb.AppendLine("var requirejs = require(\"requirejs\");");
            sb.AppendLine($"var r = requirejs.config({{   baseUrl:'{Path.Combine(Directory.GetCurrentDirectory(), "artifacts/app").Replace("\\", "/")}'}});");

            sb.AppendLine("module.exports= function (callback,data){ try{");
            sb.AppendLine($"r([\"{module}\"], function (program) {{ program.default(data, callback); }},function(err){{ console.log('host failed'); callback(err,null) }})");



            sb.AppendLine("}catch(error){console.log('host catch');callback(error,null); }}");

            Directory.CreateDirectory("tmphost");
            File.WriteAllText("tmphost/run.js", sb.ToString());
           
            return await nodeServices.InvokeAsync<TResult>("./run", data);

            //  return JToken.FromObject(await Edge.Func(sb.ToString())(data)).ToObject<TResult>();
        }

    }

    public class Program
    {
        public static async Task Main(string[] args)
        {

           

            var webhost = BuildWebHost(args);

            try
            {


                if (args.Contains("--headless"))
                {
                  
                    InstallNPMPackage("phantom");
                    InstallNPMPackage("websocket");
                    InstallNPMPackage("es6-promise");

                    await webhost.StartAsync();

                    var URLS = webhost.ServerFeatures.Get<IServerAddressesFeature>().Addresses;

                    var resultTask = await RequireJS.RunAsync<object, JToken>("src/headless", new
                    {
                        headless = $"{URLS.First()}{args[Array.IndexOf(args, "--headless") + 1]}?headless=true",
                        data = new
                        {
                            hello = "world"
                        }

                    });



                    Console.WriteLine(resultTask);

                    await webhost.StopAsync();
                }
                else
                {

                    await webhost.RunAsync();
                }

            }catch(Exception ex)
            {

                Console.WriteLine(ex);
            }


           

         
             
        }

        private static void InstallNPMPackage(string package)
        {
            var npminstall = Process.Start(new ProcessStartInfo
            {
                FileName = "cmd",
                Arguments = $"/C npm install {package}",
                WorkingDirectory = "tmphost",

            });
            npminstall.WaitForExit();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseWebRoot("artifacts/app")
                .UseStartup<Startup>()
                .Build();
    }
}
