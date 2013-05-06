/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        
        // jQuery
//        $.getScript('/app.js', function()
//        {
//        // script is now loaded and executed.
//        // put your dependent JS here.
//            refreshTodoItems();
//        });
        
        ///////////////////////////////////////////////////////////////
        var client = new WindowsAzure.MobileServiceClient('https://webtest.azure-mobile.net/', 'BDKLRlzuYxTOdMtEnDKTkHxwxuVERS56'),
        todoItemTable = client.getTable('todoitem');
        
        // Read current data and rebuild UI.
        // If you plan to generate complex UIs like this, consider using a JavaScript templating library.
        function refreshTodoItems() {
            var query = todoItemTable.where({ complete: false });
            
            query.read().then(function(todoItems) {
                              var listItems = $.map(todoItems, function(item) {
                                                    return $('<li>')
                                                    .attr('data-todoitem-id', item.id)
                                                    .append($('<button class="item-delete">Delete</button>'))
                                                    .append($('<input type="checkbox" class="item-complete">').prop('checked', item.complete))
                                                    .append($('<div>').append($('<input class="item-text">').val(item.text)));
                                                    });
                              
                              $('#todo-items').empty().append(listItems).toggle(listItems.length > 0);
                              $('#summary').html('<strong>' + todoItems.length + '</strong> item(s)');
                              });
        }
        
        function getTodoItemId(formElement) {
            return Number($(formElement).closest('li').attr('data-todoitem-id'));
        }
        
        // Handle insert
        $('#add-item').submit(function(evt) {
                              var textbox = $('#new-item-text'),
                              itemText = textbox.val();
                              if (itemText !== '') {
                              todoItemTable.insert({ text: itemText, complete: false }).then(refreshTodoItems);
                              }
                              textbox.val('').focus();
                              evt.preventDefault();
                              });
        
        // Handle update
        $(document.body).on('change', '.item-text', function() {
                            var newText = $(this).val();
                            todoItemTable.update({ id: getTodoItemId(this), text: newText });
                            });
        
        $(document.body).on('change', '.item-complete', function() {
                            var isComplete = $(this).prop('checked');
                            todoItemTable.update({ id: getTodoItemId(this), complete: isComplete }).then(refreshTodoItems);
                            });
        
        // Handle delete
        $(document.body).on('click', '.item-delete', function () {
                            todoItemTable.del({ id: getTodoItemId(this) }).then(refreshTodoItems);
                            });
        
        // On initial load, start by fetching the current data
        //refreshTodoItems();
        
        function refreshAuthDisplay() {
            var isLoggedIn = client.currentUser !== null;
            $("#logged-in").toggle(isLoggedIn);
            $("#logged-out").toggle(!isLoggedIn);
            
            
            if (isLoggedIn) {
                $("#login-name").text(client.currentUser.userId);
                refreshTodoItems();
            }
            
            
        }
        
        
        function logIn() {
            client.login("twitter").then(refreshAuthDisplay, function(error){
                                          alert(error);
                                          });
        }
        
        
        function logOut() {
            client.logout();
            refreshAuthDisplay();
            $('#summary').html('<strong>You must login to access data.</strong>');
        }
        
        
        // On page init, fetch the data and set up event handlers
        $(function () {
              refreshAuthDisplay();
              $('#summary').html('<strong>You must login to access data.</strong>');          
              $("#logged-out button").click(logIn);
              $("#logged-in button").click(logOut);
          });
        ///////////////////////////////////////////////////////////////
    }
};
