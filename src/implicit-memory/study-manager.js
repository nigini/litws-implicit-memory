/*************************************************************
 * Main code, responsible for configuring the steps and their
 * actions.
 *
 * Author: LITW Team.
 *
 * © Copyright 2017-2024 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

// load webpack modules
window.LITW = window.LITW || {}
window.$ = require("jquery");
window.jQuery = window.$;
require("../js/jquery.i18n");
require("../js/jquery.i18n.messagestore");
require("jquery-ui-bundle");
let Handlebars = require("handlebars");
window.$.alpaca = require("alpaca");
window.bootstrap = require("bootstrap");
window._ = require("lodash");

import * as litw_engine from "../js/litw/litw.engine.0.1.0";
LITW.engine = litw_engine;

//LOAD THE HTML FOR STUDY PAGES
import progressHTML from "../templates/progress.html";
Handlebars.registerPartial('prog', Handlebars.compile(progressHTML));
import introHTML from "../templates/introduction.html";
import irb_LITW_HTML from "../templates/irb2-litw.html";
import demographicsHTML from "../templates/demographics.html";
import resultsHTML from "../templates/results.html";
import resultsFooterHTML from "../templates/results-footer.html";
import commentsHTML from "../templates/comments.html";
import instructions1HTML from "./templates/instructions1.html";
import instructions2HTML from "./templates/instructions2.html";
import instructions3HTML from "./templates/instructions3.html";
import instructions4HTML from "./templates/instructions4.html";

//CONVERT HTML INTO TEMPLATES
const introTemplate = Handlebars.compile(introHTML);
const irbLITWTemplate = Handlebars.compile(irb_LITW_HTML);
const demographicsTemplate = Handlebars.compile(demographicsHTML);
const instructions1Template = Handlebars.compile(instructions1HTML);
const instructions2Template = Handlebars.compile(instructions2HTML);
const instructions3Template = Handlebars.compile(instructions3HTML);
const instructions4Template = Handlebars.compile(instructions4HTML);
const resultsTemplate = Handlebars.compile(resultsHTML);
const resultsFooterTemplate = Handlebars.compile(resultsFooterHTML);
const commentsTemplate = Handlebars.compile(commentsHTML);

module.exports = (function(exports) {
	const study_times = {
		SHORT: 5,
		MEDIUM: 10,
		LONG: 15,
	};
	let timeline = [];
	let config = {
		languages: {
			'default': 'en',
			'en': './i18n/en.json?v=1.0',
			'es': './i18n/es.json?v=1.0',
			'pt': './i18n/pt.json?v=1.0',
			'fr': './i18n/fr.json?v=1.0',
			'de': './i18n/de.json?v=1.0',
			'ja': './i18n/ja.json?v=1.0',
			'ru': './i18n/ru.json?v=1.0',
			'zh': './i18n/zh.json?v=1.0',
		},
		study_id: "TO_BE_ADDED_IF_USING_LITW_INFRA",
		study_recommendation: [],
		preLoad: ["../img/btn-next.png","../img/btn-next-active.png","../img/ajax-loader.gif"],
		slides: {
			INTRODUCTION: {
				name: "introduction",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "intro",
				template: introTemplate,
				display_next_button: false,
			},
			INFORMED_CONSENT_LITW: {
				name: "informed_consent",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "irb",
				template: irbLITWTemplate,
				template_data: {
					time: study_times.SHORT,
				},
				display_next_button: false,
			},
			DEMOGRAPHICS: {
				name: "demographics",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "demographics",
				display_next_button: false,
				template: demographicsTemplate,
				template_data: {
					local_data_id: 'LITW_DEMOGRAPHICS'
				},
				finish: function(){
					let dem_data = $('#demographicsForm').alpaca().getValue();
					LITW.data.addToLocal(this.template_data.local_data_id, dem_data);
					LITW.data.submitDemographics(dem_data);
				}
			},
			INSTRUCTIONS_1: {
				name: "instructions_1",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "instructions",
				template: instructions1Template,
				template_data: { value: 30 },
				display_next_button: true,
			},
			INSTRUCTIONS_2: {
				name: "instructions_2",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "instructions",
				template: instructions2Template,
				template_data: { value: 35 },
				display_next_button: true,
			},
			INSTRUCTIONS_3: {
				name: "instructions_3",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "instructions",
				template: instructions3Template,
				template_data: { value: 40 },
				display_next_button: true,
			},
			INSTRUCTIONS_4: {
				name: "instructions_4",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "instructions",
				template: instructions4Template,
				template_data: { value: 60 },
				display_next_button: true,
			},
			COMMENTS: {
				name: "comments",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "comments",
				display_next_button: true,
				template: commentsTemplate,
				finish: function(){
					let comments = $('#commentsForm').alpaca().getValue();
					if (Object.keys(comments).length > 0) {
						LITW.data.submitComments({
							comments: comments
						});
					}
				}
			},
			RESULTS: {
				name: "results",
				display_next_button: false,
				type: LITW.engine.SLIDE_TYPE.CALL_FUNCTION,
				call_fn: function(){
					calculateResults();
				}
			}
		}
	};

	function configureTimeline() {
		timeline.push(config.slides.INTRODUCTION);
		timeline.push(config.slides.INFORMED_CONSENT_LITW);
		timeline.push(config.slides.DEMOGRAPHICS);
		timeline.push(config.slides.INSTRUCTIONS_1);
		timeline.push(config.slides.INSTRUCTIONS_2);
		timeline.push(config.slides.INSTRUCTIONS_3);
		//TODO: Add practice trials
		timeline.push(config.slides.INSTRUCTIONS_4);
		//TODO: Add trials and break slides
		timeline.push(config.slides.COMMENTS);
		timeline.push(config.slides.RESULTS);
		return timeline;
	}

	function calculateResults() {
		//TODO: Calculate actual study results
		let results_data = {}
		showResults(results_data, true)
	}

	function showResults(results = {}, showFooter = false) {
		let results_div = $("#results");
		if('PID' in LITW.data.getURLparams) {
			results.code = LITW.data.getParticipantId();
		}

		results_div.html(
			resultsTemplate({
				data: results
			}));
		if(showFooter) {
			$("#results-footer").html(resultsFooterTemplate(
				{
					share_url: window.location.href,
					share_title: $.i18n('litw-irb-header'),
					share_text: $.i18n('litw-template-title'),
					more_litw_studies: config.study_recommendation
				}
			));
		}
		results_div.i18n();
		LITW.utils.showSlide("results");
	}

	function bootstrap() {
		let good_config = LITW.engine.configure_study(config.preLoad, config.languages,
			configureTimeline(), config.study_id);
		if (good_config){
			LITW.engine.start_study();
		} else {
			console.error("Study configuration error!");
		}
	}

	// when the page is loaded, start the study!
	$(document).ready(function() {
		bootstrap();
	});
	exports.study = {};
	exports.study.params = config

})( window.LITW = window.LITW || {} );
