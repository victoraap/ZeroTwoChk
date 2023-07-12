require('dotenv').config({ path: './.env' });
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const XLSX = require('xlsx');
const pdfjs = require('pdfjs-dist');
const namso = require('drx-namso');

const botToken = process.env.botToken;
const apiToken = process.env.apiToken;
const apiUrl = process.env.apiUrl;
const rucUrl = process.env.rucUrl;

const bot = new Telegraf(botToken);


// Comandos personalizados
const commands = [
  {
    command: 'dni',
    description: 'Buscar datos en la RENIEC',
  },
  {
    command: 'ruc',
    description: 'Buscar datos en la SUNAT',
  },
  {
    command: 'maiz1',
    description: 'Precios del maíz amarillo duro agrolalibertad.gob.pe',
  },
  {
    command: 'maiz2',
    description: 'precios del maíz amarillo duro MINAGRI',
  },
  {
    command: 'petroleo',
    description: 'precio del petroleo',
  },
  {
    command: 'urea',
    description: 'precio de la urea',
  },
  {
    command: 'dolar',
    description: 'precio del dolar',
  },
];

// Configurar comandos
bot.telegram.setMyCommands(commands);




//=================================================================
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const months = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'
];
const meses = months.slice(0, currentMonth + 1);

const url = 'http://www.agrolalibertad.gob.pe/index.php?q=node/152';
//=================================================================
const currentYear = currentDate.getFullYear();

bot.hears(/\/dni|\.dni/, async (ctx)=> {
  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    ctx.reply('El comando /dni debe tener un número de DNI después del espacio.');
    return;
  }

  const dni = args[1];

  if (dni.length !== 8) {
    ctx.reply('El número de DNI debe tener exactamente 8 dígitos.');
    return;
  }

  const url = `${apiUrl}${dni}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });

    const data = response.data;

    if (data.success) {
      const fechaNacimiento = new Date(data.data.fecha_nacimiento);
      const fechaActual = new Date();
      const diferenciaMilisegundos = fechaActual - fechaNacimiento;
      const edadMilisegundos = new Date(diferenciaMilisegundos);
      const edad = edadMilisegundos.getUTCFullYear() - 1970;

      const messageText = `
      \n\n⚜️ <b>Status</b>  -»  <code> Success ✅</code>
⚜️ <b>DNI</b>  -»  <code>${dni}</code>
⚜️ <b>Nombres Completos</b> -»  <code>${data.data.nombre_completo}</code>
⚜️ <b>Nombres</b>  -» <code>${data.data.nombres}</code>
⚜️ <b>Apellido Paterno</b> -» <code>${data.data.apellido_paterno}</code>
⚜️ <b>Apellido Materno</b> -» <code>${data.data.apellido_materno}</code> 
⚜️ <b>Edad</b> -» <code>${edad}</code> 
⚜️ <b>Fecha Nac</b> -» <code>${data.data.fecha_nacimiento}</code>  
⚜️ <b>Codigo Verificación</b> -» <code>${data.data.codigo_verificacion}</code>  
⚜️ <b>Estado Civil</b> -» <code>${data.data.estado_civil}</code> 
⚜️ <b>Direccion</b> -» <code>${data.data.direccion_completa}</code>`;

      ctx.replyWithHTML(messageText, {
        reply_to_message_id: ctx.message.message_id,
        allow_sending_without_reply: true
      });
    } else {
      const messageText = `
      \n\n⚜️ <b>Status</b>  -»  <code> No Existe ❌</code>
⚜️ <b>Response</b>  -»  <code>${data.message}</code>`;


          ctx.replyWithHTML(messageText, {
            reply_to_message_id: ctx.message.message_id,
            allow_sending_without_reply: true
          });
    }

    
  } catch (error) {
    console.error(error);
    ctx.reply('Ocurrió un error al consultar los datos del DNI.');
  }
});

bot.hears(/\/ruc|\.ruc/, async (ctx)=> {
    const args = ctx.message.text.split(' ');
    if (args.length !== 2) {
      ctx.reply('El comando /ruc debe tener un número de RUC después del espacio.');
      return;
    }
  
    const ruc = args[1];
  
    if (ruc.length !== 11) {
      ctx.reply('El número de RUC debe tener exactamente 11 dígitos.');
      return;
    }
  
    const urlRuc = `${rucUrl}${ruc}`;
  
    try {
      const response = await axios.get(urlRuc, {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      });
  
      const data = response.data;
  
      if (data.success) {
        const fechaNacimiento = new Date(data.data.fecha_nacimiento);
        const fechaActual = new Date();
        const diferenciaMilisegundos = fechaActual - fechaNacimiento;
        const edadMilisegundos = new Date(diferenciaMilisegundos);
        const edad = edadMilisegundos.getUTCFullYear() - 1970;
  
        const messageText = `
        \n\n⚜️ <b>Status</b>  -»  <code> Success ✅</code>
⚜️ <b>RUC</b>  -»  <code>${ruc}</code>
⚜️ <b>Razon Social</b> -»  <code>${data.data.nombre_o_razon_social}</code>
⚜️ <b>Estado</b>  -» <code>${data.data.estado}</code>
⚜️ <b>Condicion</b> -» <code>${data.data.condicion}</code>
⚜️ <b>Agente de Retencion</b> -» <code>${data.data.es_agente_de_retencion}</code> 
⚜️ <b>Ubigeo Sunat</b> -» <code>${data.data.ubigeo_sunat}</code>
⚜️ <b>Direccion</b> -» <code>${data.data.direccion_completa}</code>`;
  
        ctx.replyWithHTML(messageText, {
          reply_to_message_id: ctx.message.message_id,
          allow_sending_without_reply: true
        });
      } else {
        const messageText = `
        \n\n⚜️ <b>Status</b>  -»  <code> No Existe ❌</code>
⚜️ <b>Response</b>  -»  <code>${data.message}</code>`;
  
  
            ctx.replyWithHTML(messageText, {
              reply_to_message_id: ctx.message.message_id,
              allow_sending_without_reply: true
            });
      }
  
      
    } catch (error) {
      console.error(error);
      ctx.reply('Ocurrió un error al consultar los datos del RUC.');
    }
});

bot.hears(/\/dolar|\.dolar/, async (ctx)=> {
    const fechaActual = new Date().toLocaleDateString('en-GB', { timeZone: 'America/Lima' }).split('/').reverse().join('-');
    const urlCambio = `https://api.apis.net.pe/v1/tipo-cambio-sunat?fecha=${fechaActual}`;
    try {
        const response = await axios.get(urlCambio);
        const tipoCambio = response.data;

        if (tipoCambio.moneda === 'USD') {
            const messageText = `
            \n\n⚜️ <b>Status</b>  -»  <code> Success ✅</code> 
⚜️ <b>Precio de Compra</b> -»  <code>${tipoCambio.compra}</code>
⚜️ <b>Precio de Venta</b> -»  <code>${tipoCambio.venta}</code>
⚜️ <b>Moneda</b> -»  <code>${tipoCambio.moneda}</code>
⚜️ <b>Origen</b> -»  <code>${tipoCambio.origen}</code>
⚜️ <b>Fecha</b> -»  <code>${tipoCambio.fecha}</code>`;
      
            ctx.replyWithHTML(messageText, {
              reply_to_message_id: ctx.message.message_id,
              allow_sending_without_reply: true
            });
          } else {

            const messageText = `
            \n\n⚜️ <b>Status</b>  -»  <code> No Existe ❌</code>
      ⚜️ <b>Response</b>  -»  <code>${tipoCambio.message}</code>`;
      
      
                ctx.replyWithHTML(messageText, {
                  reply_to_message_id: ctx.message.message_id,
                  allow_sending_without_reply: true
                });
          }



        //console.log(`El tipo de cambio para la fecha ${fechaActual} es: ${tipoCambio}`);
    } catch (error) {
        console.error('Error al obtener el tipo de cambio:', error.message);
    }
});

bot.hears(/\/petroleo|\.petroleo/, async (ctx)=> {
  const fechaActual = Math.floor(new Date().getTime() / 1000);
  //console.log(fechaActual);
  const urlPetroleo = `https://s3.amazonaws.com/oilprice.com/widgets/oilprices/all/last.json?t=${fechaActual}`;
  try {
      const response = await axios.get(urlPetroleo);
      const petroleoData = response.data;

      if (Object.keys(petroleoData).length > 0) {
        
          const messageText = `
          \n\n⚜️ <b>Status</b>  -»  <code> Success ✅</code>        
<b>╚━━━━━「WTI Crude USA」━━━━━╝</b>
⚜️ <b>Ultimo Precio</b> -»  <code>${petroleoData["45"].price} USD</code>
⚜️ <b>Variacion</b> -»  <code>${petroleoData["45"].change}</code>
⚜️ <b>% Variacion</b> -»  <code>${petroleoData["45"].change_percent} %</code>
<b>╚━━━━━━「Brent Crude」━━━━━━╝</b>
⚜️ <b>Ultimo Precio</b> -»  <code>${petroleoData["46"].price} USD</code>
⚜️ <b>Variacion</b> -»  <code>${petroleoData["46"].change}</code>
⚜️ <b>% Variacion</b> -»  <code>${petroleoData["46"].change_percent} %</code>`;
    
          ctx.replyWithHTML(messageText, {
            reply_to_message_id: ctx.message.message_id,
            allow_sending_without_reply: true
          });
        } else {

          const messageText = `
          \n\n⚜️ <b>Status</b>  -»  <code> No Existe ❌</code>
    ⚜️ <b>Response</b>  -»  <code>${tipoCambio.message}</code>`;
    
    
              ctx.replyWithHTML(messageText, {
                reply_to_message_id: ctx.message.message_id,
                allow_sending_without_reply: true
              });
        }



      //console.log(`El tipo de cambio para la fecha ${fechaActual} es: ${tipoCambio}`);
  } catch (error) {
      console.error('Error al obtener el precio del Petroleo:', error.message);
  }
});


bot.hears(/\/maiz1|\.maiz1/, async (ctx)=> {

    axios.get(url)
    .then(response => {
      const html = response.data;
      const tableRegex = /<table id="attachments".*?>(.*?)<\/table>/gs;
      const urlRegex = /<a href="(.*?)"/g;
      let tableMatch;

      while ((tableMatch = tableRegex.exec(html)) !== null) {
        const tableContent = tableMatch[1];
        const urls = [];
        let match;

        while ((match = urlRegex.exec(tableContent)) !== null) {
          urls.push(match[1]);
        }

        const lastTwoUrls = urls.slice(-2);
        //console.log(lastTwoUrls);


        //===================================================================================================

        axios.get(lastTwoUrls[1], { responseType: 'arraybuffer' })
          .then(response => {
          const workbook = XLSX.read(response.data, { type: 'buffer' });

          //get of value of cell B4 of sheet name JUN

          const jsonData = {
          añoactual: {},
          añoanterior: {}
          };



          




          for (let i = 0; i < meses.length; i++) {
          const sheetName = meses[i];
          const sheet = workbook.Sheets[sheetName];
          //====================================================================================================
          const viruRow = findCellValuePosition(sheet, 'VIRU');
          const startCell = `B${viruRow - 2}`;
          const endCell = `S${viruRow - 2}`;
          //====================================================================================================
          const range = XLSX.utils.decode_range(`${startCell}:${endCell}`);
          let count = 0;

          for (let R = range.s.r; R <= range.e.r; ++R) {
              for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
              const cell = sheet[cellAddress];

              if (cell && cell.v) {
                  const cellValue = cell.v;

                  if (isNumeric(cellValue)) {
                  count++;
                  }
              }
              }
          }

          const dias = [];
          for (let i = 1; i <= count; i++) {
              const cell = sheet[XLSX.utils.encode_cell({ r: viruRow-3, c: i })];
              if (cell && cell.v) {
              dias.push(cell.v);
              }
          }

          const preciosValleA9 = [];
          for (let i = 1; i <= count; i++) {
              const cell = sheet[XLSX.utils.encode_cell({ r: viruRow-1, c: i })];
              if (cell && cell.v) {
              preciosValleA9.push({ fecha: dias[i - 1], precio: cell.v });
              }
          }

          const preciosValleA10 = [];
          for (let i = 1; i <= count; i++) {
              const cell = sheet[XLSX.utils.encode_cell({ r: viruRow, c: i })];
              if (cell && cell.v) {
              preciosValleA10.push({ fecha: dias[i - 1], precio: cell.v });
              }
          }

          const preciosValleA11 = [];
          for (let i = 1; i <= count; i++) {
              const cell = sheet[XLSX.utils.encode_cell({ r: viruRow+1, c: i })];
              if (cell && cell.v) {
              preciosValleA11.push({ fecha: dias[i - 1], precio: cell.v });
              }
          }

          jsonData.añoactual[meses[i]] = {
              VIRU: preciosValleA9,
              CHICAMA: preciosValleA10,
              MOCHE: preciosValleA11
          };

          
          }

          //console.log(jsonData);

          //get value of cell B4
          const sheet = workbook.Sheets[months[currentMonth]];
          const cellAddressX = 'B4';
          const cellX = sheet[cellAddressX];
          const cellValueX = cellX.v;

          //console.log("END OF LOOP");
              // Uso de la función con el objeto de datos proporcionado
              const datos = jsonData;
              
              const productos = ["VIRU", "CHICAMA", "MOCHE"];
              const ultimosPrecios = {};
              
              for (const producto of productos) {
                  const precios = obtenerUltimosPrecios(datos, producto);
                  ultimosPrecios[producto] = precios;
              }
              

              //get current year
              //var currentYear = (new Date()).getFullYear();

              const messageText = `
          \n\n⚜️ <b>Status</b>  -»  <code> Success ✅</code>    
<b>╚━━━━「Agrolalibertad」━━━━╝</b>

⚜️ <b>Fecha</b> -»  <code>${ultimosPrecios.VIRU[0].fecha} de ${ultimosPrecios.VIRU[0].mes} del ${cellValueX}</code>  
⚜️ <b>Viru Precio</b> -»  <code>S/.${ultimosPrecios.VIRU[0].precio}</code>
⚜️ <b>Chicama Precio</b> -»  <code>S/.${ultimosPrecios.CHICAMA[0].precio}</code>
⚜️ <b>Moche Precio</b> -»  <code>S/.${ultimosPrecios.MOCHE[0].precio}</code>

⚜️ <b>Fecha</b> -»  <code>${ultimosPrecios.VIRU[1].fecha} de ${ultimosPrecios.VIRU[1].mes} del ${cellValueX}</code>  
⚜️ <b>Viru Precio</b> -»  <code>S/.${ultimosPrecios.VIRU[1].precio}</code>
⚜️ <b>Chicama Precio</b> -»  <code>S/.${ultimosPrecios.CHICAMA[1].precio}</code>
⚜️ <b>Moche Precio</b> -»  <code>S/.${ultimosPrecios.MOCHE[1].precio}</code>

⚜️ <b>Fecha</b> -»  <code>${ultimosPrecios.VIRU[2].fecha} de ${ultimosPrecios.VIRU[2].mes} del ${cellValueX}</code>  
⚜️ <b>Viru Precio</b> -»  <code>S/.${ultimosPrecios.VIRU[2].precio}</code>
⚜️ <b>Chicama Precio</b> -»  <code>S/.${ultimosPrecios.CHICAMA[2].precio}</code>
⚜️ <b>Moche Precio</b> -»  <code>S/.${ultimosPrecios.MOCHE[2].precio}</code>

⚜️ <b>Fecha</b> -»  <code>${ultimosPrecios.VIRU[3].fecha} de ${ultimosPrecios.VIRU[3].mes} del ${cellValueX}</code>  
⚜️ <b>Viru Precio</b> -»  <code>S/.${ultimosPrecios.VIRU[3].precio}</code>
⚜️ <b>Chicama Precio</b> -»  <code>S/.${ultimosPrecios.CHICAMA[3].precio}</code>
⚜️ <b>Moche Precio</b> -»  <code>S/.${ultimosPrecios.MOCHE[3].precio}</code>`;
    
                const inlineKeyboardMarkup = {
                  inline_keyboard: [
                    [
                      {
                        text: 'Ver Documento XLSX',
                        url: lastTwoUrls[1],
                      },
                    ],
                  ],
                };

                const messageOptions = {
                  reply_markup: inlineKeyboardMarkup,
                  reply_to_message_id: ctx.message.message_id,
                  allow_sending_without_reply: true,
                };

                //const replyHtml = '<b>Bienvenido a Google</b>\n\nHaz clic en el botón para visitar Google.';
                ctx.replyWithHTML(messageText, messageOptions);



      })
          .catch(error => {
              console.log(error);
              }
          );


        //===================================================================================================
      }

      //console.timeEnd('Extracción de URLs');
    })
    .catch(error => {
      console.log('Error:', error);
    });

});


bot.hears(/\/maiz2|\.maiz2/, async (ctx)=> {

  axios.get('https://siea.midagri.gob.pe/portal/publicacion/boletines-diarios/12-comercializacion-maiz-amarillo')
  .then(response => {
    const regex = /<div class="pd-subcategory"><a href="([^"]+)">/;
    const matches = response.data.match(regex);
    if (matches && matches.length > 1) {
      const firstLink = matches[1];
      const url = 'https://siea.midagri.gob.pe' + firstLink;

      axios.get(url)
        .then(response => {
          const regex = /<div class="pd-subcategory"><a href="([^"]+)">/;
          const matches = response.data.match(regex);
          if (matches && matches.length > 1) {
            const firstLink = matches[1];
            const url2 = 'https://siea.midagri.gob.pe' + firstLink;

            axios.get(url2)
              .then(response => {
                const htmlCode = response.data;
                const regex = /<a\s+class="btn btn-warning"\s+href="([^"]+)"/;
                const match = regex.exec(htmlCode);

                if (match && match[1]) {
                  const firstLink3 = match[1];
                  const url3 = 'https://siea.midagri.gob.pe' + firstLink3;

                  axios.get(url3, { responseType: 'arraybuffer' })
                    .then(response => {
                      const pdfBuffer = response.data;

                      pdfjs.getDocument(pdfBuffer)
                        .promise.then(pdf => {
                          const numPages = pdf.numPages;

                          const processPage = (pageNum) => {
                            return pdf.getPage(pageNum).then(page => {
                              return page.getTextContent().then(content => {
                                const pageContent = content.items.map(item => item.str).join(' ');

                                return pageContent;
                              });
                            });
                          };

                          const pagePromises = Array.from({ length: numPages }, (_, i) => processPage(i + 1));

                          Promise.all(pagePromises)
                            .then(pages => {
                              const contentArray = pages.flat();
                              const formattedArray = contentArray[0].split('  ').map(item => item.trim());
                              const jsonOutput = JSON.stringify(formattedArray, null, 2);

                              //console.log(jsonOutput);
                              //extract el quinto elemnto del array
                              const mes = formattedArray[8];
                              const dia = formattedArray[14];
                              const precioMaximo = formattedArray[formattedArray.lastIndexOf("Precio Mínimo")-1];
                              const precioMinimo = formattedArray[formattedArray.lastIndexOf("Nor Oriente")- 1];
                              const picota = formattedArray[formattedArray.lastIndexOf("- El Dorado")- 1];
                              const eldorado = formattedArray[formattedArray.lastIndexOf("- Lamas")- 1];
                              const lamas = formattedArray[formattedArray.lastIndexOf("- Mca. Caceres")- 1];
                              const caceres = formattedArray[formattedArray.lastIndexOf("Mercados de Lima metropolitana")- 1];
                              const santaAnita = formattedArray[formattedArray.lastIndexOf("Fuente: Direcciones Regionales de Información Agraria y Mercado de Productores de Santa Anita.")- 1];

                              

                              const messageText = `
                              \n\n⚜️ <b>Status</b>  -»  <code> Success ✅</code>    
⚜️ <code>${dia} de ${mes} del ${currentYear}</code>   
<b>╚━━━━━━「Midagri」━━━━━━╝</b>
⚜️ <b>Moshoqueque</b> -»  <code>S/.${precioMinimo} - ${precioMaximo}</code>
⚜️ <b>San Martin - Picota</b> -»  <code>S/.${picota}</code>
⚜️ <b>San Martin - El Dorado</b> -»  <code>S/.${eldorado}</code>
⚜️ <b>San Martin - Lamas</b> -»  <code>S/.${lamas}</code>
⚜️ <b>San Martin - Caceres</b> -»  <code>S/.${caceres}</code>
⚜️ <b>Lima - Sta Anita</b> -»  <code>S/.${santaAnita}</code>`;
                        
                              const inlineKeyboardMarkup = {
                                inline_keyboard: [
                                  [
                                    {
                                      text: 'Ver Documento PDF',
                                      url: url3,
                                    },
                                  ],
                                ],
                              };

                              const messageOptions = {
                                reply_markup: inlineKeyboardMarkup,
                                reply_to_message_id: ctx.message.message_id,
                                allow_sending_without_reply: true,
                              };

                              //const replyHtml = '<b>Bienvenido a Google</b>\n\nHaz clic en el botón para visitar Google.';
                              ctx.replyWithHTML(messageText, messageOptions);
                              


                              
                            })
                            .catch(error => {
                              console.error(error);
                            });
                        })
                        .catch(error => {
                          console.error(error);
                        });
                    })
                    .catch(error => {
                      console.error(error);
                    });
                } else {
                  console.log('No se encontró ningún enlace');
                }
              })
              .catch(error => {
                console.error('Ocurrió un error al realizar la solicitud:', error);
              });
          } else {
            console.log('No se encontró ningún enlace con la clase "pd-subcategory".');
          }
        })
        .catch(error => {
          console.error('Error al hacer la solicitud:', error);
        });
    } else {
      console.log('No se encontró ningún enlace con la clase "pd-subcategory".');
    }
  })
  .catch(error => {
    console.error('Error al hacer la solicitud:', error);
  });


});

bot.hears(/\/urea|\.urea/, async (ctx)=> {

  const urlAPI = 'https://api.investing.com/api/financialdata/table/list/1169733?fieldmap=general.slim';

  axios.get(urlAPI)
    .then(response => {
      const responseData = response.data;
      const data = responseData.data[0].data;
      //console.log(data);
      // Aquí puedes trabajar con los valores de "data"
      const messageText = `
      \n\n⚜️ <b>Status</b>  -»  <code> Success ✅</code>
⚜️ <b>Precio </b><code>${data[0]}</code>
⚜️ <b>Precio Urea USA</b> -»  <code>${data[1]} USD</code>
⚜️ <b>Variacion Precio</b>  -» <code>${data[2]} USD</code>
⚜️ <b>Variacion Porcentaje</b> -» <code>${data[3]}%</code>`;

      ctx.replyWithHTML(messageText, {
        reply_to_message_id: ctx.message.message_id,
        allow_sending_without_reply: true
      });



    })
    .catch(error => {
      console.error('Ha ocurrido un error:', error);
    });
  

});

bot.start((ctx) => {

  let res = namso.gen({
    ShowCCV: true,
    CCV: "999",
    ShowExpDate: true,
    ShowBank: false,
    Month: "01",
    Year: "2022",
    Quantity: "10",
    Bin: "5254xxxxxxxxxxxx",
    Format: "PIPE"
   })
   //console.log(res)


  ctx.reply(res);
});


















//create empty variable

bot.hears(/^[/|.]{1}gen (.+)/, (ctx) => {
  const text = ctx.match[1].trim();
  

  if (text.length > 0) {
    const numberRegex = /\b[0-9x]{6,16}\b/;
    const numberMatch = text.match(numberRegex);
    let number = numberMatch ? numberMatch[0] : "rnd";



    if (number.length < 16) {
      const xCount = 16 - number.length;
      number += "x".repeat(xCount);
    }

    const twoDigitDateRegex = /(?:[|\/:\s])(\d{2})(?:[|\/:\s])(\d{2})/;
    const match = text.match(twoDigitDateRegex);
    const twoDigitMonth = match ? match[1] : "rnd";
    const twoDigitYear = match ? match[2] : "rnd";

    const threeDigitNumberRegex = /(?:^|\D)(\d{3})(?=\s|\/|:|\||$)/;
    const threeDigitNumberMatch = text.match(threeDigitNumberRegex);
    const threeDigitNumber = threeDigitNumberMatch ? threeDigitNumberMatch[1] : "rnd";

    const messageText = `<b>╚━━━━━━「𝒁𝒆𝒓𝒐𝑻𝒘𝒐𝑪𝒉𝒌」━━━━━━╝</b>
    ⚜️𝑰𝒏𝒑𝒖𝒕: 
    <code>${numberMatch}|${twoDigitMonth}|${twoDigitYear}|${threeDigitNumber}</code>
    ╚━━━━━━「 𝑪𝑪𝒔 ♻️ 」━━━━━━╝`;



    let res = namso.gen({
      ShowCCV: true,
      CCV: threeDigitNumber,
      ShowExpDate: true,
      ShowBank: false,
      Month: twoDigitMonth,
      Year: twoDigitYear,
      Quantity: "10",
      Bin: number,
      Format: "PIPE"
    });

      const filas = res.split('\n');
      const test = [];

      for (let i = 0; i < filas.length-1; i++) {
      const elementos = filas[i].split('|');
      const obj = {};
      obj[i] = elementos.join('|');
      test.push(obj);
      }

      //console.log(test);
      //console.log(test[0][0]);
      const cctext = `
<code>${test[0][0]}</code>
<code>${test[1][1]}</code>
<code>${test[2][2]}</code>
<code>${test[3][3]}</code>
<code>${test[4][4]}</code>
<code>${test[5][5]}</code>
<code>${test[6][6]}</code>
<code>${test[7][7]}</code>
<code>${test[8][8]}</code>
<code>${test[9][9]}</code>
`;

    ctx.replyWithHTML(`${messageText}${cctext}`, {
      reply_to_message_id: ctx.message.message_id,
      allow_sending_without_reply: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Regenerate Random',
              callback_data: 'regeneratecc',
            },
          ],
        ],
      },
    });
  } else {
    ctx.reply('No se proporcionó ningún valor después del comando.');
  }
});

bot.action('regeneratecc', (ctx) => {
  const originalCommand = ctx.update.callback_query.message.reply_to_message.text;
  //const originalMessage = ctx.callbackQuery.message;
  //const originalCommand = originalMessage.text;
  const separatorIndex = originalCommand.indexOf('.gen') !== -1 ? originalCommand.indexOf('.gen') : originalCommand.indexOf('/gen');
  const text1 = originalCommand.slice(separatorIndex + 5).trim();

  if (text1.length > 0) {
    const messageText = `<b>╚━━━━━━「𝒁𝒆𝒓𝒐𝑻𝒘𝒐𝑪𝒉𝒌」━━━━━━╝</b>
⚜️𝑰𝒏𝒑𝒖𝒕:
<code>${text1}</code>
╚━━━━━━「 𝑪𝑪𝒔 ♻️ 」━━━━━━╝`;

    const numberRegex = /\b[0-9x]{6,16}\b/;
    const numberMatch = text1.match(numberRegex);
    let number = numberMatch ? numberMatch[0] : "rnd";

    if (number.length < 16) {
      const xCount = 16 - number.length;
      number += "x".repeat(xCount);
    }

    const twoDigitDateRegex = /(?:[|\/:\s])(\d{2})(?:[|\/:\s])(\d{2})/;
    const match = text1.match(twoDigitDateRegex);
    const twoDigitMonth = match ? match[1] : "rnd";
    const twoDigitYear = match ? match[2] : "rnd";

    const threeDigitNumberRegex = /(?:^|\D)(\d{3})(?=\s|\/|:|\||$)/;
    const threeDigitNumberMatch = text1.match(threeDigitNumberRegex);
    const threeDigitNumber = threeDigitNumberMatch ? threeDigitNumberMatch[1] : "rnd";

    let res = namso.gen({
      ShowCCV: true,
      CCV: threeDigitNumber,
      ShowExpDate: true,
      ShowBank: false,
      Month: twoDigitMonth,
      Year: twoDigitYear,
      Quantity: "10",
      Bin: number,
      Format: "PIPE"
    });
    const filas = res.split('\n');
      const test = [];

      for (let i = 0; i < filas.length-1; i++) {
      const elementos = filas[i].split('|');
      const obj = {};
      obj[i] = elementos.join('|');
      test.push(obj);
      }

      //console.log(test);
      //console.log(test[0][0]);
      const cctext1 = `
<code>${test[0][0]}</code>
<code>${test[1][1]}</code>
<code>${test[2][2]}</code>
<code>${test[3][3]}</code>
<code>${test[4][4]}</code>
<code>${test[5][5]}</code>
<code>${test[6][6]}</code>
<code>${test[7][7]}</code>
<code>${test[8][8]}</code>
<code>${test[9][9]}</code>
`;

    ctx.editMessageText(`${messageText}${cctext1}`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Regenerate Random',
              callback_data: 'regeneratecc',
            },
          ],
        ],
      },
    });
  } else {
    ctx.reply('No se proporcionó ningún valor después del comando.');
  }
});







bot.launch();

/*bot.launch({
  webhook: {
    domain: 'https://calm-rose-bass-wrap.cyclic.app/',
    port: 3000
  }
});*/












  // Función para verificar si es un número
  function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}


// Función para encontrar la posición de un valor en una hoja
function findCellValuePosition(sheet, targetValue) {
    const range = sheet['!ref'];
    const [startCell, endCell] = range.split(':');
    const startRow = parseInt(startCell.match(/\d+/)[0]);
    const endRow = parseInt(endCell.match(/\d+/)[0]);
  
    for (let row = startRow; row <= endRow; row++) {
      const cellAddress = `A${row}`;
      const cellValue = sheet[cellAddress]?.v;
  
      if (cellValue === targetValue) {
        return row;
      }
    }
  
    return -1; // El valor no se encontró en la hoja
}

function obtenerUltimosPrecios(data, producto) {
    const preciosProducto = data.añoactual;
    const meses = Object.keys(preciosProducto).reverse();
    const ultimosPrecios = [];
  
    for (let i = 0; i < meses.length; i++) {
      const mes = meses[i];
      const precios = preciosProducto[mes][producto];
  
      for (let j = precios.length - 1; j >= 0 && ultimosPrecios.length < 4; j--) {
        const precio = precios[j];
        ultimosPrecios.push({
          precio: precio.precio,
          fecha: precio.fecha,
          mes: mes
        });
      }
    }
  
    return ultimosPrecios;
  }
