import "./style.scss";
import config from "../../config.json";

import { getDocuments } from "../../api";

import { useState, useEffect, useMemo } from "react";

import { useTable } from "react-table";

import { useParams } from "react-router-dom";

const Collections = () => {
  const { id } = useParams();
  const [documents, setDocuments]: Array<any> = useState([]);
  const data = useMemo(() => {
    return documents;
  }, [documents]);

  const columns = useMemo(() => {
    return config.collections[0].fields.map((field) => {
      return {
        Header: field.name,
        accessor: field.name,
      };
    });
  }, []);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  useEffect(() => {
    const getCollections = async () => {
      if (id) {
        const collections = await getDocuments(id);
        setDocuments(collections);
      }
    };

    getCollections();
  }, []);

  return (
    documents.length && (
      <table {...getTableProps()}>
        <thead>
          {
            // Loop over the header rows
            headerGroups.map((headerGroup) => (
              // Apply the header row props
              <tr {...headerGroup.getHeaderGroupProps()}>
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((column) => (
                    // Apply the header cell props
                    <th {...column.getHeaderProps()}>
                      {
                        // Render the header
                        column.render("Header")
                      }
                    </th>
                  ))
                }
              </tr>
            ))
          }
        </thead>
        <tbody {...getTableBodyProps()}>
          {
            // Loop over the table rows
            rows.map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <tr {...row.getRowProps()}>
                  {
                    // Loop over the rows cells
                    row.cells.map((cell) => {
                      // Apply the cell props
                      return (
                        <td {...cell.getCellProps()}>
                          {
                            // Render the cell contents
                            cell.render("Cell")
                          }
                        </td>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
    )
  );
};

export default Collections;
