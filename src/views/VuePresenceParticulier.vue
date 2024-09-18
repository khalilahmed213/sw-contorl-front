<template>
    <div class="table-container">
      <table class="vertical-table">
        <tbody>
          <tr>
            <th style="background-color: blue; color: aliceblue;">Nb Mois effectué</th>
            <td>{{ fakeData.months }}</td>
          </tr>
          <tr>
            <th style="background-color: blue; color: aliceblue;">SOLDE CONGE</th>
            <td>{{ fakeData.leaveBalance }}</td>
          </tr>
          <tr>
            <th style="background-color: blue; color: aliceblue;">CONGE PRISE</th>
            <td style="background-color: yellow;">{{ fakeData.leaveTaken }}</td>
          </tr>
          <tr>
            <th style="background-color: blue; color: aliceblue;">Sanction</th>
            <td style="background-color: red;">{{ fakeData.sanction }}</td>
          </tr>
          <tr>
            <th style="background-color: blue; color: aliceblue;">RESTE CONGE</th>
            <td style="background-color: yellowgreen;">{{ fakeData.remainingLeave }}</td>
          </tr>
          <tr>
            <th style="background-color: blue; color: aliceblue;">Rest ancien congé</th>
            <td>{{ fakeData.previousLeaveBalance }}</td>
          </tr>
        </tbody>
      </table>
      <table class="main-table">
        <thead>
          <tr>
            <th colspan="1" style="background-color: bisque;">Projet: 2Lcourtage</th>
            <th colspan="3" style="background-color: bisque;">AHMED BOUZID</th>
            <th colspan="1" style="background-color: bisque;">Aujourd'hui: 20/06/2024</th>
          </tr>
          <tr style="background-color: blue; color: aliceblue;">
            <th style="background-color: blue; color: aliceblue;">Date début congé</th>
            <th style="background-color: blue; color: aliceblue;">Date Fin Congé</th>
            <th style="background-color: blue; color: aliceblue;">Nb des jours</th>
            <th style="background-color: blue; color: aliceblue;" colspan="3">Raison</th> <!-- Spanning across three columns -->
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ fakeData.startDate }}</td>
            <td>{{ fakeData.endDate }}</td>
            <td>{{ fakeData.daysOff }}</td>
            <td colspan="3">{{ fakeData.reason }}</td> <!-- Spanning across three columns -->
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        fakeData: {
          months: 6,
          leaveBalance: 11,
          leaveTaken: 0,
          sanction: 0,
          remainingLeave: 10,
          previousLeaveBalance: 0,
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          daysOff: 7,
          reason: 'Congé annuel',
        }
      };
    },
  };
  </script>
  
  <style scoped>
  .table-container {
    display: flex;
    align-items: flex-start;
  }
  
  .vertical-table {
    border-collapse: collapse;
    margin-right: 20px;
  }
  
  .vertical-table th, .vertical-table td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
  }
  
  .vertical-table th {
    background-color: #f2f2f2;
  }
  
  .main-table {
    border-collapse: collapse;
    width: 100%;
  }
  
  .main-table th, .main-table td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
  }
  
  .main-table th {
    background-color: #f2f2f2;
    
  }
  </style>