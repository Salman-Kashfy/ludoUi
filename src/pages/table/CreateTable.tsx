import { Fragment, useState } from "react";
import { Card, CardContent } from "@mui/material";
import PageTitle from "../../components/PageTitle";
import { GalleryHorizontal } from "lucide-react";
import TableForm from "./TableForm";
import { SaveTable } from "../../services/table.service";
import ProgressBar from "../../components/ProgressBar";
import { useToast } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants";


function CreateTable() {
    const navigate = useNavigate();
    const { successToast, errorToast } = useToast();
    const [loader, setLoader] = useState(false);
    const [formLoader, setFormLoader] = useState(false);

    const onSubmit = (data) => {
        setLoader(true);
        SaveTable(data).then((res) => {
            if(res.status) {
                successToast('Created successfully');
                navigate(ROUTES.TABLE.EDIT(res.data.uuid));
            } else {
                errorToast(res.errorMessage || 'Failed to save table');
            }
        }).finally(() => {
            setLoader(false);
        });
    }

    return (
        <Fragment>
            <PageTitle title="Add Table" titleIcon={<GalleryHorizontal />} />
            <Card>
                <ProgressBar formLoader={formLoader}/>
                <CardContent>
                    <TableForm formLoader={formLoader} loader={loader} callback={onSubmit}/>
                </CardContent>
            </Card>
        </Fragment>
    )
}

export default CreateTable

