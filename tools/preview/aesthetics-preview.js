/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable */
const aesServiceUrl = 'https://webpage-aesthetics-ns-team-xpsuccess-sandbox.corp.ethos13-stage-va7.ethos.adobe.net/aesthetics/predict?apiKey=xpsucc3ss&url=';
const defaultHost ='https://main--gw22-aesthetics-scoring-franklin--chicharr.hlx.page';

/**
 * Retrieves the content of a metadata tag.
 * @param {string} name The metadata name (or property)
 * @returns {string} The metadata value
 */
 export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = document.head.querySelector(`meta[${attr}="${name}"]`);
  return meta && meta.content;
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
 export function loadCSS(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
  }
}

function createScoreElement(previewScore, liveScore) {  
  const div = document.createElement('div');  
  const tabMetrics = document.createElement('table');  

  div.className = 'hlx-variant';  
  tabMetrics.className = 'table_score';  
  div.appendChild(tabMetrics);
  
  const previewScoreMap = new Map();
  const liveScoreMap = new Map();
  
  previewScore.aesthetics_scores.forEach((entry) => {
    const fname = entry.feature_name.replaceAll("_"," ");
    const fvalue = parseFloat(entry.feature_value).toFixed(2);
    previewScoreMap.set(fname,fvalue);    
  });
   
  if (liveScore) {
    liveScore.aesthetics_scores.forEach((entry) => {
      const fname = entry.feature_name.replaceAll("_"," ");
      const fvalue = parseFloat(entry.feature_value).toFixed(2);
      liveScoreMap.set(fname,fvalue);    
    });
  }
  let tableMetricsContents = createTableHeader('Metric',previewScore, liveScore);
  
  for (const metric of previewScoreMap) {
    const metricName = metric[0];
    const previewValue = metric[1];
    const liveValue = liveScoreMap ? liveScoreMap.get(metricName) : '';
    tableMetricsContents = tableMetricsContents.concat(createScoreTableRow(metricName, previewValue, liveValue));
  }

  tabMetrics.innerHTML = tableMetricsContents;
  return (div);  
}


function createKpiElement(previewScore, liveScore) {  
  const div = document.createElement('div');  
  const tabKpis = document.createElement('table');

  div.className = 'hlx-variant';  
  tabKpis.className = 'table_score';

  div.appendChild(tabKpis);

  const previewKpiMap = new Map();
  const liveKpiMap = new Map();
 
  previewScore.kpi_prediction.forEach((entry) => {
    const fname = entry.kpi_name.replaceAll("_"," ");
    const fvalue = parseFloat(entry.kpi_value).toFixed(2);
    previewKpiMap.set(fname,fvalue);    
  });
  
  if (liveScore) {
    liveScore.kpi_prediction.forEach((entry) => {
      const fname = entry.kpi_name.replaceAll("_"," ");
      const fvalue = parseFloat(entry.kpi_value).toFixed(2);
      liveKpiMap.set(fname,fvalue);    
    });    
  }

  let tableKpiContents = createTableHeader('KPI', previewScore, liveScore);
  for (const kpi of previewKpiMap) {
    const metricName = kpi[0];
    const previewValue = kpi[1];
    const liveValue = liveKpiMap ? liveKpiMap.get(metricName) : '';
    tableKpiContents = tableKpiContents.concat(createKpiTableRow(metricName, previewValue, liveValue));
  }
  tabKpis.innerHTML = tableKpiContents;
  return (div);  
}



function createTableHeader(item, previewScore, liveScore) {
  let header = `<tr><th>${item}</th><th>Preview</th>`;
  if (liveScore) {
    header = header.concat('<th>Live</th>');
  }
  return header.concat('</tr>');
}


function createScoreTableRow(fName, previewValue, liveValue) {
  let backgroundColor = '';
  if (liveValue) {
    const diff = (((parseFloat(previewValue) + 1) - (parseFloat(liveValue) + 1)) * 2).toFixed(2);
    if (diff > 0) {
      backgroundColor = `rgba(0,200,0,${diff})`;
    }
    else if (diff < 0) {
      backgroundColor = `rgba(200,0,0,${diff * -1})`;
    }
  }
  let row = `<tr style="background-color: ${backgroundColor}"><td>${fName}</td><td class="table_score_number_cell">${previewValue}</td>`;
  if(liveValue) {
    row = row.concat(`<td class="table_score_number_cell">${liveValue}</td>`);
  }
  return row.concat('</tr>');
}

function createKpiTableRow(fName, previewValue, liveValue) {
  let backgroundColor = '';
  if (liveValue) {
    let diff = (((parseFloat(previewValue)) - (parseFloat(liveValue))) / 100).toFixed(2);            
    if (diff > 0) {
      diff = diff > 1 ? diff / 10 : diff;
      backgroundColor = `rgba(0,200,0,${diff})`;
    }
    else if (diff < 0) {
      diff = diff * -1;
      diff = diff > 1 ? diff / 10 : diff;
      backgroundColor = `rgba(200,0,0,${diff})`;
    }
  }
  let row = `<tr style="background-color: ${backgroundColor}"><td>${fName}</td><td class="table_score_number_cell">${previewValue}</td>`;
  if(liveValue) {
    row = row.concat(`<td class="table_score_number_cell">${liveValue}</td>`);
  }
  return row.concat('</tr>');
}

/**
 * Create Badge for Aesth Scoring
 * @return {Object} returns a badge or empty string
 */
async function createAesthScoring() {
  const div = document.createElement('div');
  div.className = 'hlx-experiment hlx-badge';
  div.classList.add(`hlx-experiment-status-active`);
  div.innerHTML = `Aesthetics Scoring: <span class="hlx-open"></span>
    <div class="hlx-popup hlx-hidden">
    <div class="hlx-variants"></div>
    </div>`;

  const popup = div.querySelector('.hlx-popup');
  div.addEventListener('click', () => {
    popup.classList.toggle('hlx-hidden');
  });
  const variantsDiv = div.querySelector('.hlx-variants')
  let url = window.location.href;
  if (url.includes('https://localhost:3000')) {
    url = url.replace('http://localhost:3000', defaultHost);
  }
  // Get live scoring
  const liveUrl = url.replace('.hlx.page', '.hlx.live'); 
  const liveScoring = await getAestheticsScoring(liveUrl);
  
 
  // Get preview scoring
  const prevScoring = await getAestheticsScoring(window.location+"?aesthetics=disabled");      
  
  variantsDiv.appendChild(createKpiElement(prevScoring, liveScoring));  
  variantsDiv.appendChild(createScoreElement(prevScoring, liveScoring));  
  
  return (div);
}

async function getAestheticsScoring(url) {    
  const startTime = new Date();

  console.log("calling aesthetics scoring for url: " + url);
  const res = await fetch(aesServiceUrl + encodeURIComponent(url));
  if (res.ok) {
    const data = await res.json();    
    const endTime = new Date();
    const timeDiff = endTime - startTime; //in ms
    console.log("time to get the score " + timeDiff + " ms.");
    return data;          
  }
  console.log("request failed");
}


/**
 * Decorates Preview mode badges and overlays
 * @return {Object} returns a badge or empty string
 */
async function decoratePreviewMode() {
  const params = new URLSearchParams(window.location.search);
  if(params.get('aesthetics')==='disabled') {
    return;
  }
  loadCSS('/tools/preview/aesthetics-preview.css');
  const overlay = document.createElement('div');
  overlay.className = 'hlx-preview-overlay';
  overlay.append(await createAesthScoring());
  document.body.append(overlay);
}

try {
  decoratePreviewMode();
} catch (e) {
  // eslint-disable-next-line no-console
  console.log(e);
}
