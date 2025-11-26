/**
 * android - react-native
 * ios - native
 */
 (function () {

	var promiseChain = Promise.resolve();

	var callbacks = {};

	var isMobile = {
			Android: function () {
					return navigator.userAgent.match(/Android/i) == null ? false : true;
			},
			iOS: function () {
					return navigator.userAgent.match(/iPhone|iPad|iPod/i) == null ? false : true;
			},
			any: function () {
					return (isMobile.Android() || isMobile.iOS());
			}
	};

	var init = function () {

			const guid = function () {
					function s4() {
							return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
					}

					return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
			}

			window.webViewBridge = {
					/**
					 * send message to the React-Native WebView onMessage handler
					 * @param targetFunc - name of the function to invoke on the React-Native side
					 * @param data - data to pass
					 * @param success - success callback
					 * @param error - error callback
					 */
					send: function (targetFunc, data, success, error) {
							var msgObj = {
									targetFunc: targetFunc,
									data: data || {}
							};

							if (success || error) {
									msgObj.msgId = guid();
							}

							var msg = JSON.stringify(msgObj);

							promiseChain = promiseChain.then(function () {
									return new Promise(function (resolve, reject) {
											if (msgObj.msgId) {
													callbacks[msgObj.msgId] = {
															onsuccess: success,
															onerror: error
													};
											}

											if (isMobile.any()) {
													if (isMobile.Android()) {
														//
														try{
															window.Android && window.Android.postMessage(msg);
														}catch(err){
															window.postMessage(msg, '*');
														}
														resolve();
													} else if (isMobile.iOS()) {

															if (!webkit || !webkit.messageHandlers) {
																	// alert('오류가 발생했습니다. ' + targetFunc);
																	console.log('오류가 발생했습니다. ' + targetFunc);
																	return;
															}
															if (!webkit.messageHandlers[targetFunc]) {
																	// alert('오류가 발생했습니다. ' + targetFunc);
																	console.log('오류가 발생했습니다. ' + targetFunc);
																	return;
															}

															webkit.messageHandlers[targetFunc].postMessage(msg);
													}
											}

											resolve();
									})
							}).catch(function (e) {
									console.log(e);
									console.error('webview bridge send failed : ' + e.message);
							});
					}
			};

			window.document.addEventListener('message', function (e) {

					console.log('on listen event : ' + e);
					console.log('on listen event : ' + JSON.stringify(e));
					var message;


					if (isMobile.any()) {
							if (isMobile.Android()) {
									try {
										console.log('on listen event : ' + e.detail);
										message = JSON.parse(e.detail);
									} catch (err) {
										try{
											message = JSON.parse(e.data);
										}
										catch (err2) {
											console.error("failed to parse message from react-native " + err2);
											return;
										}
									}
							} else if (isMobile.iOS()) {
									try {
											console.log('on listen event e.detail : ' + e.detail);
											message = JSON.parse(e.detail)
									} catch (err) {
										try{
											message = JSON.parse(e.data);
										}
										catch (err2) {
											console.error("failed to parse message from react-native " + err2);
											return;
										}
									}
							}
					} else {
							console.error('');
							return;
					}

					//trigger callback
					console.log(message.args);
					console.log(callbacks[message.msgId]);

					if (callbacks[message.msgId]) {
							console.log(JSON.stringify(message));

							if (message.isSuccessfull) {
									console.log('오류가 발생했습니다.' + JSON.stringify(message.args));
									callbacks[message.msgId].onsuccess.apply(null, [message.args]);
							} else {
									console.log('오류가 발생했습니다.');
									callbacks[message.msgId].onerror.apply(null, [message.args]);
							}
							delete callbacks[message.msgId];
					} else if (message.event) {
						    console.log(`message Event :: ${message.event} ${message}`);
							window.document.dispatchEvent(new CustomEvent('appStateChanged', {detail: message}));
					}

			});
	};

	init();
}());
